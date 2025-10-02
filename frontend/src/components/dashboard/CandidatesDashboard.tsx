import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { RootState } from '@/store';
import { setSearchTerm, setSorting } from '@/store/slices/candidatesSlice';
import { showCandidateDetails } from '@/store/slices/uiSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function CandidatesDashboard() {
  const dispatch = useDispatch();
  const { candidates, searchTerm, sortBy, sortOrder } = useSelector((state: RootState) => state.candidates);

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'score':
          comparison = (a.finalScore || 0) - (b.finalScore || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [candidates, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: 'score' | 'name' | 'createdAt') => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    return status === 'completed' ? (
      <Badge variant="default" className="bg-success text-success-foreground">
        Completed
      </Badge>
    ) : (
      <Badge variant="secondary">
        In Progress
      </Badge>
    );
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return <span className="text-muted-foreground">-</span>;
    
    let variant: "default" | "secondary" | "destructive" = "secondary";
    if (score >= 8) variant = "default";
    else if (score < 5) variant = "destructive";

    return (
      <Badge variant={variant} className={
        score >= 8 ? "bg-success text-success-foreground" : 
        score < 5 ? "" : "bg-warning text-warning-foreground"
      }>
        {score}/10
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {candidates.length}</span>
          <span>Completed: {candidates.filter(c => c.status === 'completed').length}</span>
          <span>In Progress: {candidates.filter(c => c.status === 'incomplete').length}</span>
        </div>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedCandidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'No candidates found matching your search.' : 'No interview candidates yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium"
                      >
                        Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('score')}
                        className="h-auto p-0 font-medium"
                      >
                        Score {getSortIcon('score')}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('createdAt')}
                        className="h-auto p-0 font-medium"
                      >
                        Date {getSortIcon('createdAt')}
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCandidates.map((candidate, index) => (
                    <motion.tr
                      key={candidate.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-pointer hover:bg-muted/50"
                      onClick={() => dispatch(showCandidateDetails(candidate.id))}
                    >
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{getScoreBadge(candidate.finalScore)}</TableCell>
                      <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                      <TableCell>
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(showCandidateDetails(candidate.id));
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}