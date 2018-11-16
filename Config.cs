using System;
using System.IO;
using Newtonsoft.Json;

namespace Lyzde
{
    public class Config
    {
        public static Configuration Current { get; private set; }

        public static void LoadConfig(string jsonPath = "config.json")
        {
            if (!File.Exists(jsonPath))
            {
                Console.WriteLine($"Config file `{jsonPath}` not found.");
                Environment.Exit(-1);
            }

            try
            {
                var jsonString = File.ReadAllText(jsonPath);
                Current = JsonConvert.DeserializeObject<Configuration>(jsonString);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Failed to parse config file: " + ex.Message);
                Environment.Exit(-1);
            }
        }

        [Serializable]
        public struct Configuration
        {
            public struct Administrator
            {
                public string Username { get; set; }
                public string Password { get; set; }
            }

            public struct DatabaseConnection
            {
                public string Host { get; set; }
                public short Port { get; set; }
                public string User { get; set; }
                public string Password { get; set; }
                public string Database { get; set; }
            }

            public struct ProductionConfig
            {
                public string Front { get; set; }
            }

            public Administrator Admin { get; set; }

            public DatabaseConnection Database { get; set; }

            public ProductionConfig Production { get; set; }
        }
    }
}