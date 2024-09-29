import os
import re
import pytesseract
from pdf2image import convert_from_path
import pikepdf
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
from pathlib import Path

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

# Set a base directory to store files
BASE_DIR = Path("./pdf_files")
if not BASE_DIR.exists():
    BASE_DIR.mkdir(parents=True, exist_ok=True)

def extract_page_number(filename):
    match = re.search(r'(\d+)', filename)
    return int(match.group(1)) if match else float('inf')

def convert_pdf_to_images(input_pdf, output_folder, dpi=300):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    images = convert_from_path(input_pdf, dpi=dpi)
    image_files = []
    for i, image in enumerate(images):
        image_path = os.path.join(output_folder, f"page_{i+1}.png")
        image.save(image_path, "PNG")
        image_files.append(image_path)
    return image_files

def images_to_searchable_pdf(image_files):
    temp_pdf_files = []
    for i, image_file in enumerate(image_files):
        temp_pdf = f"temp_page_{i+1}.pdf"
        pdf_bytes = pytesseract.image_to_pdf_or_hocr(image_file, extension='pdf')
        with open(temp_pdf, 'wb') as f:
            f.write(pdf_bytes)
        temp_pdf_files.append(temp_pdf)
    return temp_pdf_files

def merge_pdfs(temp_pdf_files, output_pdf):
    with pikepdf.Pdf.new() as pdf:
        for temp_pdf in sorted(temp_pdf_files, key=extract_page_number):
            src = pikepdf.open(temp_pdf)
            pdf.pages.extend(src.pages)
        pdf.save(output_pdf)

def convert_pdf_to_searchable_pdf(input_pdf, output_pdf, output_image_folder, dpi=300):
    image_files = convert_pdf_to_images(input_pdf, output_image_folder, dpi=dpi)
    temp_pdf_files = images_to_searchable_pdf(image_files)
    merge_pdfs(temp_pdf_files, output_pdf)
    return output_pdf

def extract_text_from_images(image_files):
    text = ""
    for image_file in image_files:
        text += pytesseract.image_to_string(image_file) + "\n"
    return text

@app.post("/convert/")
def convert_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Set paths for storing input and output
    input_pdf_path = BASE_DIR / file.filename
    output_pdf_path = BASE_DIR / f"output_{file.filename}"
    images_folder = BASE_DIR / f"{file.filename}_images"
    
    with open(input_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Convert PDF and store output
        convert_pdf_to_searchable_pdf(input_pdf_path, output_pdf_path, images_folder)
        
        if not output_pdf_path.exists():
            raise HTTPException(status_code=500, detail="Output file was not created")
        
        # Return the processed file
        return FileResponse(output_pdf_path, media_type="application/pdf", filename=f"searchable_{file.filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/extract_text/")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_input = os.path.join(temp_dir, "input.pdf")
        images_folder = os.path.join(temp_dir, "images")
        
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            image_files = convert_pdf_to_images(temp_input, images_folder)
            text = extract_text_from_images(image_files)
            return PlainTextResponse(text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")

@app.delete("/cleanup/")
def cleanup_files():
    try:
        shutil.rmtree(BASE_DIR)  # Remove the base directory and all files in it
        BASE_DIR.mkdir(parents=True, exist_ok=True)  # Recreate the directory
        return {"message": "Files cleaned up successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during cleanup: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
