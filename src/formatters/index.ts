/**
 * JSON and YAML formatters and validators
 * Client-side only implementation without external dependencies
 */

// JSON functions
export function validateJson(input: string): boolean {
    try {
        JSON.parse(input);
        return true;
    } catch (error) {
        return false;
    }
}

export function formatJson(input: string): string {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        throw new Error(`Invalid JSON: ${(error as Error).message}`);
    }
}

// YAML functions - simplified implementation
// Note: A full YAML parser would require a dependency, so this is a simple version
// that handles basic YAML validation and formatting

// Simple YAML validation function
export function validateYaml(input: string): boolean {
    // Basic validation checks for common YAML syntax errors
    try {
        // Check for proper indentation and colons
        const lines = input.split('\n');
        let prevIndentation = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimEnd();
            
            // Skip empty lines and comments
            if (line.trim() === '' || line.trim().startsWith('#')) {
                continue;
            }
            
            // Check for proper key-value syntax
            if (line.includes(':')) {
                const parts = line.split(':');
                if (parts.length < 2) {
                    return false;
                }
                
                // Key should not contain spaces (unless quoted)
                const key = parts[0].trim();
                if (key.includes(' ') && !(key.startsWith('"') && key.endsWith('"')) && 
                    !(key.startsWith("'") && key.endsWith("'"))) {
                    return false;
                }
            }
            
            // Check for array items
            if (line.trim().startsWith('- ')) {
                // Valid array item
            }
            
            // Improper tab usage
            if (line.includes('\t')) {
                return false;
            }
            
            // Check for unmatched quotes
            let inSingleQuote = false;
            let inDoubleQuote = false;
            
            for (const char of line) {
                if (char === "'" && !inDoubleQuote) {
                    inSingleQuote = !inSingleQuote;
                } else if (char === '"' && !inSingleQuote) {
                    inDoubleQuote = !inDoubleQuote;
                }
            }
            
            if (inSingleQuote || inDoubleQuote) {
                return false; // Unclosed quotes
            }
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

export function formatYaml(input: string): string {
    if (!validateYaml(input)) {
        throw new Error('Invalid YAML format');
    }
    
    try {
        // Basic YAML formatting
        const lines = input.split('\n');
        const formattedLines: string[] = [];
        let currentIndentation = 0;
        let inArray = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Skip empty lines and preserve comments
            if (line.trim() === '') {
                formattedLines.push('');
                continue;
            }
            
            if (line.trim().startsWith('#')) {
                formattedLines.push(line);
                continue;
            }
            
            // Determine indentation level from the line content
            const trimmedLine = line.trimStart();
            const indentation = line.length - trimmedLine.length;
            
            // Check if this is an array item
            const isArrayItem = trimmedLine.startsWith('- ');
            
            // Format the line with consistent indentation
            let formattedLine = '';
            
            if (isArrayItem) {
                // Array item
                formattedLine = ' '.repeat(currentIndentation) + trimmedLine;
                inArray = true;
            } else if (trimmedLine.includes(':')) {
                // Key-value pair
                const [key, ...valueParts] = trimmedLine.split(':');
                const value = valueParts.join(':').trim();
                
                if (value) {
                    // Key with inline value
                    formattedLine = ' '.repeat(currentIndentation) + key.trim() + ': ' + value;
                } else {
                    // Key with nested values
                    formattedLine = ' '.repeat(currentIndentation) + key.trim() + ':';
                    currentIndentation += 2; // Increase indentation for nested items
                }
                
                inArray = false;
            } else {
                // Other content (should be rare in well-formed YAML)
                formattedLine = ' '.repeat(currentIndentation) + trimmedLine;
            }
            
            formattedLines.push(formattedLine);
        }
        
        return formattedLines.join('\n');
    } catch (error) {
        throw new Error(`YAML formatting failed: ${(error as Error).message}`);
    }
}
