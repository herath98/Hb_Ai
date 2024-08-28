import { Link } from "react-router-dom";
import "./chatList.css";
import { useQuery } from "@tanstack/react-query";

const ChatList = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className="chatList">
      <div className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300 h-auto overflow-y-scroll">
        <div className="grid grid-cols-1" >
          <span className="title">DASHBOARD</span>
          <Link to="/dashboard">Create a new Chat</Link>
          <Link to="/">Explore HU AI</Link>
          <Link to="/">Contact</Link>
        </div>
       

        <span className="title">RECENT CHATS</span>
        <div className="grid grid-cols-1 ">
          {isPending
            ? "Loading..."
            : error
              ? "Something went wrong!"
              : data?.map((chat) => (
                <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                  {chat.title}
                </Link>
              ))}
        </div>
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <span>Upgrade to HU AI Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div >
  );
};

export default ChatList;
