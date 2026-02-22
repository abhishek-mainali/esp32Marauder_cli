import { useState, useCallback, useRef, useEffect } from 'react';

interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    writable: WritableStream;
    readable: ReadableStream;
    getInfo(): { usbVendorId?: number; usbProductId?: number };
}

interface SerialPortStreamReader {
    read(): Promise<{ value: Uint8Array; done: boolean }>;
    releaseLock(): void;
    cancel(): Promise<void>;
}

interface SerialPortStreamWriter {
    write(data: Uint8Array): Promise<void>;
    releaseLock(): void;
}

export interface SerialDeviceInfo {
    usbVendorId?: number;
    usbProductId?: number;
}

export const useSerial = () => {
    const [connected, setConnected] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState<string>("Disconnected");
    const [incomingData, setIncomingData] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const portRef = useRef<SerialPort | null>(null);
    const readerRef = useRef<SerialPortStreamReader | null>(null);
    const writerRef = useRef<SerialPortStreamWriter | null>(null);

    const isWebSerialSupported = () =>
        typeof navigator !== 'undefined' && 'serial' in navigator;

    const readLoop = useCallback(async () => {
        if (!portRef.current || !readerRef.current) return;

        while (connected) {
            try {
                const { value, done } = await readerRef.current.read();
                if (done) break;
                const text = new TextDecoder().decode(value);
                setIncomingData(text);
            } catch (err) {
                console.error("Read error:", err);
                break;
            }
        }
    }, [connected]);

    const connect = useCallback(async (baudRate: number = 115200) => {
        try {
            setError(null);
            if (!isWebSerialSupported()) {
                setError('Web Serial API is not supported in this browser. Use Chrome, Edge, or Opera over HTTPS (or localhost).');
                return false;
            }
            const nav = navigator as unknown as { serial: { requestPort: () => Promise<SerialPort> } };
            const port = await nav.serial.requestPort();
            await port.open({ baudRate });

            portRef.current = port;
            writerRef.current = port.writable.getWriter() as unknown as SerialPortStreamWriter;
            readerRef.current = port.readable.getReader() as unknown as SerialPortStreamReader;

            const info = port.getInfo();
            setDeviceInfo(`Device: ESP32\nVID: ${info.usbVendorId || "N/A"}\nPID: ${info.usbProductId || "N/A"}\nBaud: ${baudRate}\nStatus: CONNECTED`);
            setConnected(true);

            return true;
        } catch (err: unknown) {
            console.error("Serial Connection Failed:", err);
            setError(err instanceof Error ? err.message : String(err));
            return false;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (readerRef.current) {
                readerRef.current.cancel().catch(() => {});
            }
            if (writerRef.current) {
                writerRef.current.releaseLock();
            }
        };
    }, []);

    useEffect(() => {
        if (connected) {
            readLoop();
        }
    }, [connected, readLoop]);

    const disconnect = useCallback(async () => {
        try {
            if (readerRef.current) {
                await readerRef.current.cancel();
                readerRef.current.releaseLock();
            }
            if (writerRef.current) {
                writerRef.current.releaseLock();
            }
            if (portRef.current) {
                await portRef.current.close();
            }

            setConnected(false);
            setIncomingData("");
            setDeviceInfo("Disconnected");
            portRef.current = null;
            readerRef.current = null;
            writerRef.current = null;
        } catch (err: unknown) {
            console.error("Disconnect error:", err);
        }
    }, []);

    const send = useCallback(async (data: string) => {
        if (!writerRef.current) return;
        const encoder = new TextEncoder();
        try {
            await writerRef.current.write(encoder.encode(data + "\n"));
        } catch (err) {
            console.error("Write error:", err);
        }
    }, []);

    return {
        connected,
        deviceInfo,
        error,
        incomingData,
        connect,
        disconnect,
        send,
    };
};
