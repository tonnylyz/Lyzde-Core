using Newtonsoft.Json.Linq;
using System.IO;

namespace Lyzde
{
    public class Config
    {
        public Config(string jsonPath = "config.json")
        {
            var jsonString = File.ReadAllText(jsonPath);
            var root = JObject.Parse(jsonString);
            foreach (var token in (JObject)root["admin"])
            {
                if (token.Key == "username")
                {
                    AdminUsername = token.Value.ToString();
                }
                else if (token.Key == "password")
                {
                    AdminPassword = token.Value.ToString();
                }
            }

            foreach (var token in (JObject)root["database"])
            {
                switch (token.Key)
                {
                    case "host":
                        DatabaseHost = token.Value.ToString();
                        break;
                    case "port":
                        DatabasePort = token.Value.ToObject<ushort>();
                        break;
                    case "user":
                        DatabaseUser = token.Value.ToString();
                        break;
                    case "password":
                        DatabasePassword = token.Value.ToString();
                        break;
                    case "database":
                        DatabaseDatabase = token.Value.ToString();
                        break;
                }
            }
        }

        public static Config Current { get; set; }

        public string AdminUsername { get; private set; }
        public string AdminPassword { get; private set; }

        public string DatabaseHost { get; private set; }
        public ushort DatabasePort { get; private set; }
        public string DatabaseUser { get; private set; }
        public string DatabasePassword { get; private set; }
        public string DatabaseDatabase { get; private set; }

    }
}
