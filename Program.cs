using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace Lyzde
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Config.LoadConfig();
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
        }
    }
}