﻿using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace Lyzde
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Config.LoadConfig();
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
        }
    }
}