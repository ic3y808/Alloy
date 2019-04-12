﻿using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using Alloy.Helpers;

namespace Alloy.Services
{
	public class SimpleHTTPServer
	{
		private Thread _serverThread;
		private HttpListener _listener;

		public int Port { get; set; }
		public string RootDirectory { get; set; }

		public SimpleHTTPServer(string path, int port)
		{
			Initialize(path, port);
		}

		public SimpleHTTPServer(string path)
		{
			TcpListener l = new TcpListener(IPAddress.Loopback, 0);
			l.Start();
			int port = ((IPEndPoint)l.LocalEndpoint).Port;
			l.Stop();
			Initialize(path, port);
		}

		public void Stop()
		{
			_serverThread?.Abort();
			_listener?.Stop();
		}

		private void Initialize(string path, int port)
		{
			RootDirectory = path;
			Port = port;
			_serverThread = new Thread(Listen);
			_serverThread.Start();
		}

		private void Listen()
		{
			System.Diagnostics.Debug.WriteLine("Listener called");
			_listener = new HttpListener();
			_listener.Prefixes.Add("http://+:8001/");
			_listener.Start();
			_listener.BeginGetContext(Process, _listener);
		}

		private void Process(IAsyncResult result)
		{
			HttpListenerContext context = _listener.EndGetContext(result);
			string filename = context.Request.Url.AbsolutePath;
			System.Diagnostics.Debug.WriteLine("Server Request: " + filename);
			filename = filename.Substring(1);
			if (string.IsNullOrEmpty(filename))
			{
				string mediaUri = Path.Combine(Android.OS.Environment.GetExternalStoragePublicDirectory("Music").Path);
				DirectoryInfo di = new DirectoryInfo(mediaUri);
				FileInfo[] files = di.GetFiles("*.mp3", SearchOption.AllDirectories);
				string response = files.Aggregate("<!DOCTYPE html>\n<body>\n", (current, file) => current + $"<a href=\"{file.FullName.Replace(RootDirectory, "")}\">{file.Name}</a>\n");
				response += "</body>\n</html>\n";
				byte[] buffer = Encoding.UTF8.GetBytes(response);

				context.Response.ContentLength64 = buffer.Length;
				context.Response.OutputStream.Write(buffer, 0, buffer.Length);
				context.Response.OutputStream.Close();
			}
			else
			{
				filename = Path.Combine(RootDirectory, Uri.UnescapeDataString(filename));

				if (File.Exists(filename))
				{
					Stream input = new FileStream(filename, FileMode.Open);

					context.Response.ContentType = WebHelpers.MimeTypeMappings.TryGetValue(Path.GetExtension(filename), out string mime) ? mime : "application/octet-stream";
					context.Response.ContentLength64 = input.Length;
					context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
					context.Response.AddHeader("Last-Modified", File.GetLastWriteTime(filename).ToString("r"));

					byte[] buffer = new byte[1024 * 16];
					int nbytes;
					while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0)
						context.Response.OutputStream.Write(buffer, 0, nbytes);

					context.Response.OutputStream.Flush();
					input.Close();
				}
				else
				{
					context.Response.StatusCode = (int)HttpStatusCode.NotFound;
				}

				context.Response.OutputStream.Close();
			}
			_listener.BeginGetContext(Process, _listener);
		}
	}
}