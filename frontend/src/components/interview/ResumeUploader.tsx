import { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showError, setUploading } from '@/store/slices/uiSlice';
import { addCandidate } from '@/store/slices/candidatesSlice';
import { startInterview } from '@/store/slices/interviewSlice';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { RootState } from '@/store';

export function ResumeUploader() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = useSelector((state: RootState) => state.ui.isUploading);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (file) {
        const fileName = file.name.toLowerCase();
        const isPdf =
          file.type === 'application/pdf' || fileName.endsWith('.pdf');
        const isDocx =
          file.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileName.endsWith('.docx');

        if (isPdf || isDocx) {
          setSelectedFile(file);
          toast({
            title: 'File selected',
            description: `${file.name} is ready to upload.`,
          });
        } else {
          dispatch(showError('Please upload a PDF or DOCX file'));
        }
      }
    },
    [dispatch, toast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const isPdf =
        file.type === 'application/pdf' || fileName.endsWith('.pdf');
      const isDocx =
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx');

      if (isPdf || isDocx) {
        setSelectedFile(file);
        toast({
          title: 'File selected',
          description: `${file.name} is ready to upload.`,
        });
      } else {
        dispatch(showError('Please upload a PDF or DOCX file'));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    dispatch(setUploading(true));

    try {
      const parseResult = await apiService.parseResume(selectedFile);

      // Generate interview questions using backend API
      const questionsResponse = await apiService.generateQuestions('Full Stack Developer');
      const questions = questionsResponse.questions.map((q, index) => ({
        id: q.id || `q-${Date.now()}-${index}`,
        text: q.text,
        difficulty: q.difficulty,
        timeLimit: q.time_limit || (q.difficulty === 'easy' ? 20 : q.difficulty === 'medium' ? 60 : 120),
      }));

      const candidateId = `candidate-${Date.now()}`;

      // Add candidate
      dispatch(
        addCandidate({
          id: candidateId,
          name: parseResult.name || '',
          email: parseResult.email || '',
          phone: parseResult.phone || '',
          questions,
          status: 'incomplete',
          createdAt: new Date().toISOString(),
        })
      );

      // Start interview
      dispatch(startInterview(candidateId));

      toast({
        title: 'Resume uploaded successfully',
        description: 'Your interview will begin shortly.',
      });

      setSelectedFile(null); // reset selected file
    } catch (error) {
      dispatch(
        showError(
          error instanceof Error ? error.message : 'Failed to upload resume'
        )
      );
    } finally {
      dispatch(setUploading(false));
    }
  };

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <motion.div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Upload Your Resume</h3>
            <p className="text-muted-foreground">
              Drag and drop your PDF or DOCX file here, or click to browse
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            Choose File
          </Button>
        </div>
      </motion.div>

      {/* Selected File */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleUpload}
            className="w-full"
            size="lg"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Start Interview'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
