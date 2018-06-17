using System;
using System.Net;
using Lyzde.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lyzde
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            var connStr = $"Host={Config.Current.Database.Host};" +
                          $"Port={Config.Current.Database.Port};" +
                          $"Username={Config.Current.Database.User};" +
                          $"Password={Config.Current.Database.Password};" +
                          $"Database={Config.Current.Database.Database}";
            
            services.AddEntityFrameworkNpgsql().AddDbContext<LyzdeContext>(options => options.UseNpgsql(connStr));
            services.AddDistributedMemoryCache();
            services.AddSession();
            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddJsonOptions(options =>
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
            
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = 
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownProxies.Add(IPAddress.Parse(Config.Current.Production.Front));
            });
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseForwardedHeaders();
            app.UseAuthentication();
#if DEBUG
            app.UseDeveloperExceptionPage();
#else
            app.UseStatusCodePages();
#endif
            app.UseStaticFiles();
            app.UseSession();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    "default",
                    "Ajax/{controller}/{action=Index}/{id?}");
            });
        }
    }
}
