document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-window');
    const optionsSection = document.getElementById('options-section');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');



    function addRatingUI(bubble) {
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'flex items-center gap-3 mt-4 p-2 border-t border-gray-200';
        
        const ratingText = document.createElement('span');
        ratingText.textContent = 'Was this tutorial helpful?';
        ratingText.className = 'text-sm text-gray-600';
        
        const thumbsUp = document.createElement('button');
        thumbsUp.innerHTML = '👍';
        thumbsUp.className = 'hover:scale-110 transition-transform p-1';
        
        const thumbsDown = document.createElement('button');
        thumbsDown.innerHTML = '👎';
        thumbsDown.className = 'hover:scale-110 transition-transform p-1';
        
        [thumbsUp, thumbsDown].forEach(btn => {
            btn.onclick = function() {
                ratingDiv.innerHTML = '<span class="text-green-600 text-sm">Thank you for your feedback!</span>';
            };
        });
        
        ratingDiv.append(ratingText, thumbsUp, thumbsDown);
        bubble.appendChild(ratingDiv);
    }

    function appendMessage(content, isUser, link = null, description = null, time = null) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `flex items-start gap-2 ${isUser ? "justify-end" : ""}`;

        if (!isUser) {
            // Add the cat icon for bot messages
            const iconDiv = document.createElement("div");
            iconDiv.className = "bot-icon flex-shrink-0";
            const catIcon = document.createElement("i");
            catIcon.className = "fa-solid fa-cat text-teal-500 text-2xl"; // Icon styling
            iconDiv.appendChild(catIcon);
            messageDiv.appendChild(iconDiv);
        }

        const bubble = document.createElement("div");
        bubble.className = isUser
            ? "user-message bg-blue-500 text-white p-3 rounded-lg shadow max-w-md"
            : "bot-message bg-teal-100 text-gray-800 p-3 rounded-lg shadow max-w-md";

        if (link && description && time) {
            // Add title as a clickable link
            const titleElement = document.createElement("a");
            titleElement.href = link;
            titleElement.target = "_blank";
            titleElement.textContent = content;
            titleElement.className = "text-blue-600 font-bold underline block mb-2"; 
            bubble.appendChild(titleElement);

            // Add description
            const descriptionElement = document.createElement("p");
            descriptionElement.textContent = description;
            descriptionElement.className = "text-sm text-gray-700 mb-2"; 
            bubble.appendChild(descriptionElement);

            // Add time
            const timeElement = document.createElement("p");
            timeElement.textContent = `Duration: ${time}`;
            timeElement.className = "text-sm text-gray-600 font-semibold"; 
            bubble.appendChild(timeElement);

            addRatingUI(bubble);
        } else {
            // Plain text for other messages
            bubble.textContent = content;
        }

        messageDiv.appendChild(bubble);
        chatContainer.appendChild(messageDiv);

        // Auto-scroll to the latest message
        chatContainer.scrollTop = chatContainer.scrollHeight;


    }


    // Handle predefined options
    const predefinedOptions = document.querySelectorAll('.option-button');
    predefinedOptions.forEach(option => {
        option.addEventListener('click', () => {
            const userChoice = option.textContent;

            // Display user's choice in the chat
            appendMessage(userChoice, true);

            // Remove options section after selection
            optionsSection.style.display = 'none';

            // Send choice to the backend
            sendMessageToBackend(userChoice);
        });
    });

    // Handle text input
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
    
        appendMessage(message, true); // Show user input
        userInput.value = ""; // Clear input field
        sendMessageToBackend(message); // Send to backend
    }
    
    // Handle text input on button click
    sendButton.addEventListener('click', handleSendMessage);
    
    // Handle text input on pressing Enter
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Show "I am thinking..." message
    function showThinkingMessage() {
        const thinkingMessage = document.createElement("div");
        thinkingMessage.id = "thinking-message";
        thinkingMessage.className = "flex items-start gap-2";

        // Add the cat icon
        const iconDiv = document.createElement("div");
        iconDiv.className = "bot-icon flex-shrink-0";
        const catIcon = document.createElement("i");
        catIcon.className = "fa-solid fa-cat text-teal-500 text-2xl"; // Icon styling
        iconDiv.appendChild(catIcon);
        thinkingMessage.appendChild(iconDiv);

        // Add "thinking" text
        const bubble = document.createElement("div");
        bubble.className = "bot-message bg-teal-100 text-gray-800 p-3 rounded-lg shadow max-w-md";
        bubble.textContent = "I’m thinking...";
        thinkingMessage.appendChild(bubble);

        chatContainer.appendChild(thinkingMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll
    }

    // Remove "I am thinking..." message
    function removeThinkingMessage() {
        const thinkingMessage = document.getElementById("thinking-message");
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
    }

    // Parse tutorial from the response text
    function parseTutorial(replyText) {
        const tutorial = {};
        let remainingText = replyText;
    
        console.log("parseTutorial function invoked");
    
        // Extract the title
        const titleMatch = replyText.match(/Title:\s*(.+)/);
        if (titleMatch) {
            tutorial.title = titleMatch[1].trim();
            remainingText = remainingText.replace(titleMatch[0], "").trim();
        }
    
        // Extract the description
        const descriptionMatch = replyText.match(/Description:\s*(.+)/);
        if (descriptionMatch) {
            tutorial.description = descriptionMatch[1].trim();
            remainingText = remainingText.replace(descriptionMatch[0], "").trim();
        }
    
        // Extract the URL
        const urlMatch = replyText.match(/URL:\s*\[.+?\]\((.+?)\)/);
        if (urlMatch) {
            tutorial.link = urlMatch[1].trim();
            remainingText = remainingText.replace(urlMatch[0], "").trim();
        }
    
        // Extract the time
        const timeMatch = replyText.match(/Time:\s*(.+)/);
        if (timeMatch) {
            tutorial.time = timeMatch[1].trim();
            remainingText = remainingText.replace(timeMatch[0], "").trim();
        }
    
        // Extract text before the tutorial
        const beforeTutorial = replyText.split(/Title:/)[0].trim();
    
        // Remove beforeTutorial from remainingText to get afterTutorial
        const afterTutorial = remainingText.replace(beforeTutorial, "").trim();
    
        console.log("Before Tutorial:", beforeTutorial);
        console.log("Tutorial:", tutorial);
        console.log("After Tutorial:", afterTutorial);
    
        return {
            tutorial: tutorial.title && tutorial.link ? tutorial : null,
            beforeTutorial,
            afterTutorial,
        };
    }
    
    

    // Send message to backend
    async function sendMessageToBackend(message) {
        showThinkingMessage(); // Show "I am thinking..." message

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            removeThinkingMessage(); // Remove "I am thinking..." message

            if (data.reply.includes("Title:")) {
                const { tutorial, beforeTutorial, afterTutorial } = parseTutorial(data.reply);
                
                
                // Display text before the tutorial in a separate bubble
                if (beforeTutorial) {
                    appendMessage(beforeTutorial, false);
                }

                // Display tutorial details in a formatted bubble
                if (tutorial) {
                    appendMessage(
                        tutorial.title,
                        false,
                        tutorial.link,
                        tutorial.description,
                        tutorial.time
                    );
                }

                // Display text after the tutorial in another separate bubble
                if (afterTutorial) {
                    appendMessage(afterTutorial, false);
                }
            } else {
                // Regular bot response
                appendMessage(data.reply, false);
            }

            // Show new options if available
            if (data.options) {
                displayOptions(data.options);
            }
        } catch (error) {
            console.error("Error communicating with the backend:", error);
            removeThinkingMessage(); // Ensure thinking message is removed
            appendMessage("Something went wrong. Please try again later.", false);
        }
    }
});














