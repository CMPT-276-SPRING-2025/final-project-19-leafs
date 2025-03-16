const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// Create message element with dynamic classes and return it
const createMessageElement = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add("message", classes);
    div.innerHTML = content;
    return div;
}

// Handle outgoing user messages
const handleOutgoingMessage = (userMessage) => {
    
    // Create and display user message
    const messageContent = `<div class="message-text">${userMessage}</div>`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
}

//Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        handleOutgoingMessage(userMessage);
    }
});

// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");

        }
    }
});

document.querySelector(".chat-form").appendChild(picker);
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));