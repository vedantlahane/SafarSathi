import os

def extract_yatrax_ml_code(root_dir, output_file):
    # Directories to skip
    exclude_dirs = {'data', 'models', '__pycache__', '.git'}
    # Extensions to skip
    exclude_exts = {'.md', '.pyc', '.ipynb', '.csv', '.joblib', '.pkl'}

    with open(output_file, 'w', encoding='utf-8') as f_out:
        for root, dirs, files in os.walk(root_dir):
            # Exclude specified directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for file in files:
                # Exclude .md files and binary/data extensions
                if any(file.endswith(ext) for ext in exclude_exts):
                    continue
                
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_dir)
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f_in:
                        content = f_in.read()
                        
                        # Add headers for each file
                        f_out.write(f"\n{'='*80}\n")
                        f_out.write(f"FILE: {rel_path}\n")
                        f_out.write(f"{'='*80}\n\n")
                        f_out.write(content)
                        f_out.write("\n")
                except Exception as e:
                    print(f"Skipping {rel_path}: {e}")

if __name__ == "__main__":
    # Path to your yatrax-ml folder
    path_to_folder = r"c:\Users\Admin\Desktop\YatraX\yatrax-ml"
    # Target text file
    output_filename = "yatrax_ml_complete_code.txt"
    
    extract_yatrax_ml_code(path_to_folder, output_filename)
    print(f"Successfully extracted code to {output_filename}")
