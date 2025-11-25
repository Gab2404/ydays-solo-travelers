const ChatMessage = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-slate-100 text-slate-800 rounded-bl-none'
      }`}>
        <p className="text-sm">{message.text}</p>
        <span className={`text-[10px] block mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
          {message.time}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;