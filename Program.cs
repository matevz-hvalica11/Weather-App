using Microsoft.AspNetCore.StaticFiles;
using Umbraco.Cms.Web.Common.ApplicationBuilder;

var builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .Build();

var app = builder.Build();

await app.BootUmbracoAsync();

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = new FileExtensionContentTypeProvider()
    {
        Mappings =
        {
            [".woff2"] = "font/woff2",
            [".woff"] = "font/woff",
            [".tff"] = "font/ttf"
        }
    }
});

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

app.MapControllerRoute(
    name: "weather",
    pattern: "Weather/{action=Index}/{city?}",
    defaults: new { controller = "Weather" }
);

app.MapFallback(context =>
{
    context.Response.StatusCode = 404;
    return context.Response.WriteAsync("Site was not found (404).");
});

await app.RunAsync();