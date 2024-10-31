import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create or get existing assistant - should be created once and reused
async function getAssistant() {
  try {
    // Try to retrieve existing assistant
    const assistants = await openai.beta.assistants.list({
      order: "desc",
      limit: 1,
    });

    const existingAssistant = assistants.data.find(
      (assistant) => assistant.name === "File Search Assistant"
    );

    if (existingAssistant) {
      console.log("📎 Using existing assistant:", existingAssistant.id);
      return existingAssistant;
    }

    // Create new assistant if none exists
    const assistant = await openai.beta.assistants.create({
      name: "File Search Assistant",
      instructions: "You are a helpful assistant that can search and analyze uploaded files. Provide detailed insights and answer questions about the file contents.",
      model: "gpt-4-turbo-preview",
      tools: [{ type: "file_search" }],
    });

    console.log("📎 Created new assistant:", assistant.id);
    return assistant;
  } catch (error) {
    console.error("❌ Error getting/creating assistant:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if the request is multipart form data
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      console.log("📦 Processing file upload request");
      
      const formData = await req.formData();
      const files = formData.getAll('files');
      
      console.log(`📑 Processing ${files.length} files`);

      // Upload files to OpenAI
      const fileIds = [];
      for (const file of files) {
        if (file instanceof File) {
          console.log(`📄 Processing file: ${file.name} (${file.type})`);
          
          // Convert File to Buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Create a proper Blob for OpenAI
          const blob = new Blob([buffer], { type: file.type });

          // Create a File object from the Blob
          const fileObject = new File([blob], file.name, {
            type: file.type,
          });

          try {
            // Upload file to OpenAI
            const uploadedFile = await openai.files.create({
              file: fileObject,
              purpose: 'assistants',
            });

            console.log(`✅ File uploaded to OpenAI with ID: ${uploadedFile.id}`);
            fileIds.push(uploadedFile.id);
          } catch (uploadError) {
            console.error(`❌ Error uploading file ${file.name}:`, uploadError);
            throw uploadError;
          }
        }
      }

      if (fileIds.length === 0) {
        throw new Error("No files were successfully uploaded");
      }

      // Get or create assistant
      const assistant = await getAssistant();
      console.log("🤖 Using assistant:", assistant.id);

      // Create a thread
      const thread = await openai.beta.threads.create();
      console.log("🧵 Created thread:", thread.id);

      // Add files to the assistant
      const updatedAssistant = await openai.beta.assistants.update(assistant.id, {
        file_ids: fileIds,
      });
      console.log("📎 Updated assistant with files:", updatedAssistant.id);

      // Add a message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Please analyze these files and provide insights about their contents.",
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      console.log("🚀 Started run:", run.id);

      // Poll for completion
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        console.log(`🔄 Run status: ${runStatus.status}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      if (runStatus.status === 'completed') {
        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];
        
        // Process all content blocks in the message
        const responseContent = lastMessage.content.map(content => {
          if (content.type === 'text') {
            return content.text.value;
          }
          return '';
        }).join('\n');

        console.log("✅ Analysis complete with response:", responseContent);

        return NextResponse.json({ 
          message: responseContent,
          threadId: thread.id,
          assistantId: assistant.id,
          fileIds: fileIds
        });
      } else {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
    } else {
      // Handle regular text messages
      const { message, threadId, assistantId } = await req.json();
      console.log("📥 Received text message:", message);

      if (threadId && assistantId) {
        // Continue existing conversation
        await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: message,
        });

        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantId,
        });

        let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        
        while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
          console.log(`🔄 Run status: ${runStatus.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        }

        if (runStatus.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(threadId);
          const lastMessage = messages.data[0];
          const responseContent = lastMessage.content.map(content => {
            if (content.type === 'text') {
              return content.text.value;
            }
            return '';
          }).join('\n');

          return NextResponse.json({ message: responseContent });
        }
      } else {
        // Regular chat completion for messages without thread context
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: message }],
          model: "gpt-4-turbo-preview",
        });

        const aiResponse = completion.choices[0]?.message?.content || "";
        console.log("📤 OpenAI response:", aiResponse);

        return NextResponse.json({ message: aiResponse });
      }
    }
  } catch (error) {
    console.error("❌ Error in chat route:", error);
    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
