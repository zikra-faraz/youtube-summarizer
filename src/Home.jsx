import React, { useState, useEffect } from "react";
import Logout from "./components/Logout";
import { useUserData, useAccessToken } from "@nhost/react";
// import { Video, LogOut } from 'lucide-react';
import axios from "axios";

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let duration = "";
  if (hours > 0) {
    duration += `${hours}h `;
  }
  if (minutes > 0) {
    duration += `${minutes}m `;
  }
  if (remainingSeconds > 0) {
    duration += `${remainingSeconds}s`;
  }

  return duration.trim();
};
function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const [error, setError] = useState("");
  const user = useUserData();
  const accessToken = useAccessToken();
  // const accessToken = user?.accessToken;
  // console.log(accessToken);
  // console.log({ user });
  // console.log(import.meta.env.VITE_ADMIN_SECRET);
  useEffect(() => {
    fetchHistory();
  }, []);
  const graphqlUrl =
    "https://ljikpemqnxknqaiyxdxr.hasura.ap-south-1.nhost.run/v1/graphql";

  //store summary
  const storeSummary = async (url, data) => {
    const { summary: s, lengthInSeconds, title } = data;

    const query = `
    mutation insertSummary($video_url: String!, $summary: String!, $length_in_seconds: bigint!, $title: String!) {
      insert_summaries_one(object: {
        video_url: $video_url,
        summary: $summary,
        length_in_seconds: $length_in_seconds,
        title: $title
      }) {
        id
        video_url
        summary
        length_in_seconds
        title
      }
    }
  `;

    const variables = {
      video_url: url,
      summary: s,
      length_in_seconds: lengthInSeconds,
      title,
    };

    try {
      const response = await axios.post(
        graphqlUrl,
        {
          query,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": "H$gr^b=#Z;fIo2x=L)i)!u2N%i=KpYk-",
          },
        }
      );
      // console.log(response);

      if (response.data.errors) {
        // console.error("GraphQL Error:", response.data.errors);
        throw new Error("Failed to insert data into Nhost.");
      }

      // console.log(
      //   "Data inserted into Nhost:",
      //   response.data.data.insert_summaries_one
      // );
      return response.data.data.insert_summaries_one;
    } catch (error) {
      console.error("Error storing summary in Nhost:", error);
    }
  };

  //check summary
  const getSummary = async (url) => {
    const query = `
      query getSummaryByVideoUrl($url: String!) {
        summaries(where: { video_url: { _eq: $url } }) {
          id
          video_url
          summary
          length_in_seconds
          title
        }
      }
    `;

    const variables = { url };

    try {
      const response = await axios.post(
        graphqlUrl,
        { query, variables },
        {
          headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": "H$gr^b=#Z;fIo2x=L)i)!u2N%i=KpYk-",
          },
        }
      );

      if (response.data.errors) {
        // console.error("GraphQL Error:", response.data.errors);
        throw new Error("Failed to fetch summary from Nhost.");
      }

      const summary = response.data.data.summaries[0];
      // console.log("Fetched Summary:", summary);
      return summary;
    } catch (error) {
      console.error("Error fetching summary from Nhost:", error);
      throw error;
    }
  };
  // console.log(history);

  // Fetch all titles for history
  const fetchHistory = async () => {
    const query = `
    query getAllSummaries {
      summaries {
        id
        title
      }
    }
  `;
    try {
      const response = await axios.post(
        graphqlUrl,
        { query },
        {
          headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": "H$gr^b=#Z;fIo2x=L)i)!u2N%i=KpYk-",
          },
        }
      );
      if (response.data.errors) {
        console.error("GraphQL Error:", response.data.errors);
        throw new Error("Failed to fetch history.");
      }
      setHistory(response.data.data.summaries);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
  // Fetch specific summary by title
  const fetchSummaryById = async (id) => {
    const query = `
      query getSummaryById($id: uuid!) {
        summaries(where: { id: { _eq: $id } }) {
          id
          video_url
          summary
          length_in_seconds
          title
        }
      }
    `;
    const variables = { id };
    try {
      const response = await axios.post(
        graphqlUrl,
        { query, variables },
        {
          headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": "H$gr^b=#Z;fIo2x=L)i)!u2N%i=KpYk-",
          },
        }
      );
      if (response.data.errors) {
        // console.error("GraphQL Error:", response.data.errors);
        throw new Error("Failed to fetch specific summary.");
      }
      setSummary(response.data.data.summaries[0]);
    } catch (error) {
      console.error("Error fetching specific summary:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const existingSummary = await getSummary(url);
    // console.log("Existing Summary:", existingSummary);
    if (existingSummary) {
      setSummary(existingSummary);
      setLoading(false);
    } else {
      try {
        // console.log(url);

        // Replace 'YOUR_WEBHOOK_URL' with the actual n8n webhook URL
        // console.log("getting data from n8n");

        const response = await axios.post(
          "https://n8n-dev.subspace.money/webhook/youtube-zikra",
          { url }
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch summary");
        }
        const data = response.data; // Use response.data for the payload
        // console.log(data);

        await storeSummary(url, data);
        setSummary(data);
        // console.log(summary);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="./video-camera.png" alt="" width={26} />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Video Summarizer
              </span>
            </div>
            <div className="flex gap-3 justify-center items-center">
              <img
                src="logout.png"
                alt=""
                width={26}
                className="hidden sm:block"
              />
              <Logout />
              <p className="text-gray-700   hidden sm:block">
                Welcome, {user.displayName || user.email.split("@")[0]}
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-8xl  mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6 md:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">History</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => fetchSummaryById(item.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 border border-gray-200"
                >
                  <p className="text-gray-800 font-medium line-clamp-2">
                    {item.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 md:col-span-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 ">
              Generate Video Summary
            </h2>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="url"
                  className="block text-lg font-medium text-gray-700 mt-4"
                >
                  Enter Youtube Video URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="shadow-sm h-10 focus:ring-1 focus:outline-none px-3 focus:border-gray-400  block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter video URL here"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? "opacity-75 " : ""
                }`}
              >
                {loading ? "Generating Summary..." : "Generate Summary"}
              </button>
            </form>
            {/* Error Display */}
            {error && (
              <div className="mt-4 text-red-600 font-medium">
                <p>{error}</p>
              </div>
            )}

            {/* Summary Display */}
            {summary ? (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 ">
                  Video Title :
                </h3>

                <p className="text-cyan-900 text-xl  mb-5">{summary.title}</p>
                <h3 className="text-lg font-medium text-gray-900 ">
                  Time Duration :
                </h3>

                <p className="text-gray-700 text-lg  mb-5">
                  {" "}
                  {formatDuration(summary.lengthInSeconds)}
                </p>

                <h3 className="text-lg font-medium text-gray-900 ">
                  Video Summary :
                </h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: summary.summary
                        .replace(/\*/g, "")
                        .replace(/\n/g, "<br />"),
                    }}
                  ></p>{" "}
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
