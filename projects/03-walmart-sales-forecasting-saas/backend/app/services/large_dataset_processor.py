import pandas as pd
from typing import Generator, Dict, Optional, Callable
import asyncio
import os
import io

class LargeDatasetProcessor:
    """
    Efficient processing for large datasets
    """
    
    CHUNK_SIZE = 10000  # Process 10k rows at a time
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    def __init__(self):
        self.progress = 0
        self.total_chunks = 0
    
    async def process_large_file(self, file_path: str, process_chunk_callback: Callable[[pd.DataFrame], pd.DataFrame] = None) -> pd.DataFrame:
        """
        Process large files in chunks with progress tracking
        """
        # Get file size
        file_size = os.path.getsize(file_path)
        
        if file_size > self.MAX_FILE_SIZE:
            raise ValueError(f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum allowed (50MB)")
        
        # Determine total valid lines for progress (rough estimate or exact count)
        # For CSV, we can count lines quickly
        total_rows = 0
        with open(file_path, 'rb') as f:
             for _ in f:
                 total_rows += 1
        total_rows -= 1 # Header
        
        if total_rows <= 0:
             total_rows = 1 # Avoid division by zero
             
        self.total_chunks = (total_rows // self.CHUNK_SIZE) + 1
        
        # Read in chunks
        chunks = []
        try:
            chunk_generator = pd.read_csv(file_path, chunksize=self.CHUNK_SIZE)
        except Exception:
             # Fallback for excel or other formats (read all at once if chunking not supported readily by pandas for that format)
             # Start with simple read for now
             df = pd.read_csv(file_path)
             if process_chunk_callback:
                 df = process_chunk_callback(df)
             return df
        
        current_chunk = 0
        
        for chunk in chunk_generator:
            # Process chunk if callback provided
            if process_chunk_callback:
                processed_chunk = process_chunk_callback(chunk)
            else:
                processed_chunk = self._default_process_chunk(chunk)
                
            chunks.append(processed_chunk)
            
            # Update progress
            current_chunk += 1
            self.progress = (current_chunk / self.total_chunks) * 100
             
            # Yield control to prevent blocking
            await asyncio.sleep(0)
        
        # Combine all chunks
        if chunks:
            combined_df = pd.concat(chunks, ignore_index=True)
        else:
            combined_df = pd.DataFrame()
        
        return combined_df
    
    def _default_process_chunk(self, chunk: pd.DataFrame) -> pd.DataFrame:
        """
        Default processing if no callback
        """
        # Basic cleaning
        return chunk.dropna(how='all')
    
    def get_sample_for_preview(self, file_content: bytes, n=1000) -> pd.DataFrame:
        """
        Get sample data for quick preview without loading entire file
        """
        # Read first N rows
        try:
            sample = pd.read_csv(io.BytesIO(file_content), nrows=n)
        except:
             try:
                 sample = pd.read_excel(io.BytesIO(file_content), nrows=n)
             except Exception as e:
                 raise ValueError(f"Could not read sample: {str(e)}")
        
        return sample
