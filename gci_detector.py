from datetime import datetime
from fuzzywuzzy import process

# Define the keywords
keywords = ['Problem Statement', 'Problem Analysis', 'Next Actions']

def gci_detector(input_text):
    try:
        if not input_text:
            return "Error: No input text provided"
        
        # Split the input text into blocks based on the new line separator
        input_blocks = input_text.split('\n')

        # Initialize output dictionary
        output = {}

        # Parse each input block and extract sentences after the keywords
        for i in range(len(input_blocks)):
            block = input_blocks[i]
            # Find the best matching keyword for the block substring
            best_match, score = process.extractOne(block, keywords)
            # Check if the score is above a certain threshold to avoid false positives
            if score >= 80:
                # Use the best matching keyword as the key
                key = best_match
                # Initialize a list to store the sentences after the keyword
                sentences = []
                for j in range(i+1, len(input_blocks)):
                    # Find the best matching keyword for the input block
                    best_match, score = process.extractOne(input_blocks[j], keywords)
                    # Check if the score is above a certain threshold to avoid false positives
                    if score >= 80:
                        # Reached the next keyword, break out of loop
                        break
                    else:
                        # Extract all the sentences after the keyword
                        sentences.append(input_blocks[j])
                # Join the sentences together to form a paragraph
                paragraph = ' '.join(sentences)
                # Store the paragraph under the keyword
                output[key] = paragraph.rstrip()

        # Format the output as HTML
        output_text = ''
        for key, paragraph in output.items():
            output_text += f"<h3>{key}</h3><p>Updated by Anton Neledov at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}:<br><br>{paragraph}</p>"

        return output_text

    except Exception as e:
        return f"Error: {e}"
