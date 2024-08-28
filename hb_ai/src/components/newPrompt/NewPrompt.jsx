import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const endRef = useRef(null);
  const formRef = useRef(null);
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  // Initialize chat session
  const chat = model.startChat({
    history: data?.history?.map(({ role, parts }) => ({
      role,
      parts: [{ text: parts?.[0]?.text || "" }],
    })),
    generationConfig: {
      // maxOutputTokens: 100, // You can adjust this based on your needs
    },
  });

  // Scroll to the latest chat message when data updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer, img.dbData]);

  // Handle form submission for new messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (text) {
      add(text, false);
    }
  };

  // Handle adding a new message and getting a response from the AI
  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);

    try {
      const result = await chat.sendMessageStream(
        Object.keys(img.aiData).length ? [img.aiData, text] : [text]
      );

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      mutation.mutate();
    } catch (err) {
      console.error(err);
    }
  };

  // Mutation to update chat history on the server
  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question || undefined,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] }).then(() => {
        formRef.current.reset();
        setQuestion("");
        setAnswer("");
        setImg({
          isLoading: false,
          error: "",
          dbData: {},
          aiData: {},
        });
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  // Run initial chat logic when component mounts
  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
      hasRun.current = true;
    }
  }, [data]);

  return (
    <>
      {/* Display loading indicator for image */}
      {img.isLoading && <div>Loading...</div>}

      {/* Display uploaded image */}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}

      {/* Display user question */}
      {question && <div className="message user">{question}</div>}

      {/* Display AI's answer */}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}

      {/* Scroll to the latest message */}
      <div className="endChat" ref={endRef}></div>

      {/* Form for sending a new message */}
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        <input id="file" type="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="Ask anything..." />
        <button type="submit">
          <img src="/arrow.png" alt="Send" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
