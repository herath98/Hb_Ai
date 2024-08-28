import "./chatPage.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-md">
        <div className="chat">
          {isPending ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">Something went wrong!</div>
          ) : (
            data?.history?.map((message, i) => (
              <div key={i} className="mb-4">
                {message.img && (
                  <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={message.img}
                    height="300"
                    width="400"
                    transformation={[{ height: 300, width: 400 }]}
                    loading="lazy"
                    lqip={{ active: true, quality: 20 }}
                    className="rounded-md mb-2"
                  />
                )}
                <div
                  className={`p-4 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-100 text-blue-800 self-end"
                      : "bg-gray-100 text-gray-800 self-start"
                  }`}
                >
                  <Markdown>{message.parts[0].text}</Markdown>
                </div>
              </div>
            ))
          )}

          {data && <NewPrompt data={data} />}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
