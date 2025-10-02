import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store';
import { setActiveTab, showWelcomeBack } from '@/store/slices/uiSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntervieweePage } from './pages/IntervieweePage';
import { InterviewerPage } from './pages/InterviewerPage';
import { WelcomeBackModal } from './modals/WelcomeBackModal';
import { ErrorModal } from './modals/ErrorModal';
import { CandidateDetailModal } from './modals/CandidateDetailModal';

export function MainLayout() {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state: RootState) => state.ui);
  const { currentCandidateId, isInterviewActive } = useSelector((state: RootState) => state.interview);

  useEffect(() => {
    // Check if there's an incomplete interview on load (user left mid-interview)
    if (currentCandidateId && !isInterviewActive) {
      dispatch(showWelcomeBack());
    }
  }, [currentCandidateId, isInterviewActive, dispatch]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Interview Assistant
              </h1>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => dispatch(setActiveTab(value as 'interviewee' | 'interviewer'))}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="interviewee" className="text-sm">
              Interviewee
            </TabsTrigger>
            <TabsTrigger value="interviewer" className="text-sm">
              Interviewer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interviewee" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <IntervieweePage />
            </motion.div>
          </TabsContent>

          <TabsContent value="interviewer" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InterviewerPage />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <WelcomeBackModal />
      <ErrorModal />
      <CandidateDetailModal />
    </div>
  );
}