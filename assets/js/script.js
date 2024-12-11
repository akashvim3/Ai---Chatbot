let prompt = document.querySelector("#prompt")
let submitbtn = document.querySelector("#submit")
let chatContainer = document.querySelector(".chat-container")
let imagebtn = document.querySelector("#image")
let image = document.querySelector("#image img")
let imageinput = document.querySelector("#image input")

// Correct API URL with proper key syntax
const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBwJHmauM35mV2OOLtzSnf0vrnoKZitRvw"

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
}

// Main function to generate response from the API
async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area")

    // Constructing the request payload
    let bodyContent = {
        "contents": [
            {
                "parts": [
                    { text: user.message }
                ]
            }
        ]
    }

    // If a file is present, include it in the request body
    if (user.file.data) {
        bodyContent.contents[0].parts.push({
            inline_data: user.file
        })
    }

    let requestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyContent)
    }

    try {
        let response = await fetch(Api_Url, requestOption)
        let data = await response.json()

        // Process the response from the API
        let apiResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1")  // Remove Markdown-style bold text
            .trim()

        text.innerHTML = apiResponse
    } catch (error) {
        console.log(error)
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })
        image.src = `img.svg`
        image.classList.remove("choose")
        user.file = {}  // Reset file data after response
    }
}

// Function to create chat box elements dynamically
function createChatBox(html, classes) {
    let div = document.createElement("div")
    div.innerHTML = html
    div.classList.add(classes)
    return div
}

// Function to handle user message and file inputs
function handlechatResponse(userMessage) {
    user.message = userMessage
    let html = `
        <img src="assets/images/user.png" alt="" id="userImage" width="8%">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>`

    prompt.value = ""  // Clear input after submission
    let userChatBox = createChatBox(html, "user-chat-box")
    chatContainer.appendChild(userChatBox)

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

    setTimeout(() => {
        let aiHtml = `
            <img src="assets/images/ai.png" alt="" id="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="" class="load" width="50px">
            </div>`
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box")
        chatContainer.appendChild(aiChatBox)
        generateResponse(aiChatBox)
    }, 600)
}

// Event listener for submitting text with Enter key
prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value)
    }
})

// Event listener for submit button
submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value)
})

// Event listener for image input changes
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0]
    if (!file) return

    let reader = new FileReader()
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1]
        user.file = {
            mime_type: file.type,
            data: base64string
        }
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`
        image.classList.add("choose")
    }
    reader.readAsDataURL(file)
})

// Event listener for image button click
imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click()
})
