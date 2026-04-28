// dataFetcher.js

// In a real application with a bundler (like Vite, Webpack, or a Node backend), 
// you would access the environment variable you defined in .env like this:
// const dataSource = process.env.DATA_SOURCE_PATH;

// For our static frontend setup without a bundler, we will use a fallback
// mimicking the environment variable approach:
const DATA_SOURCE_PATH = 'data/products.json'; 

async function loadProductData() {
    try {
        console.log(`[Fetcher] Requesting data from: ${DATA_SOURCE_PATH}`);
        
        // Fetch the JSON file
        const response = await fetch(DATA_SOURCE_PATH);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON data
        const products = await response.json();
        
        console.log('[Fetcher] Successfully loaded product data:');
        console.table(products); // Using console.table for a nice, structured view in the console
        
        return products;
    } catch (error) {
        console.error('[Fetcher] Failed to load product data:', error);
    }
}

// Call the function to test the fetcher
loadProductData();
