using System;
using System.IO;
using Newtonsoft.Json;

namespace Lyzde
{
    public class Config
    {
        public Config(string jsonPath = "config.json")
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
                Console.WriteLine("Failed to parse config file.");
                Environment.Exit(-1);
            }
        }

        [Serializable]
        public struct Configuration
        {
            public struct Administrator
            {
                public string Username { get; }
                public string Password { get; }
            }

            public struct DatabaseConnection
            {
                public string Host { get; }
                public short Port { get; }
                public string User { get; }
                public string Password { get; }
                public string Database { get; }
            }

            public Administrator Admin { get; }

            public DatabaseConnection Database { get; }
        }

        public static Configuration Current { get; private set; }
    }
}