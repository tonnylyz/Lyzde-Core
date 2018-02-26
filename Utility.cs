using System.Text.RegularExpressions;
using Lyzde.Models;
using Microsoft.AspNetCore.Http;

namespace Lyzde
{
    public class Utility
    {

        public static string Sanitize(string html)
        {
            if (string.IsNullOrEmpty(html)) return html;
            var tagReg = new Regex("<[^>]*(>|$)",
                RegexOptions.Singleline | RegexOptions.ExplicitCapture | RegexOptions.Compiled);
            var tags = tagReg.Matches(html);
            for (var i = tags.Count - 1; i > -1; i--)
            {
                var tag = tags[i];
                html = html.Remove(tag.Index, tag.Length);
            }
            return html;
        }

        public static Visit Log(HttpRequest request, string operation)
        {
            var userAgent = request.Headers["User-Agent"].ToString();
            var ip = request.HttpContext.Connection.RemoteIpAddress;
            var url = "N/A";
            if (request.Headers["Referer"].Count != 0)
                url = request.Headers["Referer"].ToString();

            url = Sanitize(url);
            userAgent = Sanitize(userAgent);

            var visit = new Visit
            {
                IP = ip,
                Url = url,
                UserAgent = userAgent,
                Operation = operation
            };
            return visit;
        }

    }
}
