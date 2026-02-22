export interface MarauderCommand {
    cmd: string;
    description: string;
    category: "General" | "WiFi Scan" | "WiFi Attack" | "Bluetooth" | "Aux";
    macros?: string[];
}

export const MARAUDER_COMMANDS: MarauderCommand[] = [
    { cmd: "help", description: "Display available commands", category: "General" },
    { cmd: "reboot", description: "Reboot the ESP32 Marauder", category: "General" },
    { cmd: "info", description: "Show device information", category: "General" },

    { cmd: "scanap", description: "Scan for Access Points", category: "WiFi Scan" },
    { cmd: "scansta", description: "Scan for Stations", category: "WiFi Scan" },
    { cmd: "stopscan", description: "Stop any running scan", category: "WiFi Scan" },

    { cmd: "attack -t deauth", description: "Deauthentication Attack", category: "WiFi Attack" },
    { cmd: "attack -t beacon", description: "Beacon Spam Attack", category: "WiFi Attack" },
    { cmd: "evilportal -c start", description: "Start Evil Portal", category: "WiFi Attack" },

    { cmd: "btspamall", description: "Spam Bluetooth devices", category: "Bluetooth" },
    { cmd: "sniffbt", description: "Sniff Bluetooth traffic", category: "Bluetooth" },

    { cmd: "listap", description: "List discovered Access Points", category: "Aux" },
    { cmd: "select -a all", description: "Select all discovered APs", category: "Aux" },
    { cmd: "clearap", description: "Clear the list of APs", category: "Aux" },
];

export const MACROS = [
    {
        name: "Full Recon",
        description: "Scan APs, then stations, then list all.",
        steps: ["scanap", "stopscan", "scansta", "stopscan", "listap"]
    },
    {
        name: "Target & Deauth",
        description: "Scan, select target index, and attack.",
        steps: ["scanap", "stopscan", "select -a 0", "attack -t deauth"]
    }
];
