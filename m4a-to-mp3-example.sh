#!/bin/bash

input_directory="./m4as"
output_directory="./mp3s"

# Ensure output directory exists
mkdir -p "$output_directory"

# Loop through all .m4a files in the input directory
for file in "$input_directory"/*.m4a; do
    if [[ -f "$file" ]]; then
        filename=$(basename "$file" .m4a)
        output_file="$output_directory/$filename.mp3"
        echo "Converting $file to $output_file"

        ffmpeg -i "$file" -codec:a libmp3lame -qscale:a 2 "$output_file"
    fi
done

echo "Conversion complete."