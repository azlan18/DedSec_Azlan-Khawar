const { Pinecone } = require('@pinecone-database/pinecone');
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference("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");

async function queryPineconeVectorStore(pineconeInstance, indexName, namespace, query) {
    try {
        // Generate embeddings using Hugging Face API
        const apiOutput = await hf.featureExtraction({
            model: "mixedbread-ai/mxbai-embed-large-v1",
            inputs: query,
        });

        const queryEmbedding = Array.from(apiOutput);

        // Query Pinecone vector database
        const index = pineconeInstance.index(indexName);
        const queryResponse = await index.namespace(namespace).query({
            topK: 5,
            vector: queryEmbedding,
            includeMetadata: true,
            includeValues: false,
        });

        if (queryResponse.matches.length > 0) {
            return queryResponse.matches
                .map((match, index) => `\nClinical Finding ${index + 1}: \n${match.metadata?.chunk}`)
                .join(". \n\n");
        } else {
            return "<nomatches>";
        }
    } catch (error) {
        console.error("Error querying Pinecone:", error);
        return "";
    }
}

module.exports = { queryPineconeVectorStore };
