import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Hash, Loader2, ExternalLink } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { toast } from '@/hooks/use-toast';

export function TopicManager() {
  const { createTopic } = useHederaAccount();
  const [topicMemo, setTopicMemo] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdTopicId, setCreatedTopicId] = useState('');

  const handleCreateTopic = async () => {
    if (!topicMemo) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic memo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTopic(topicMemo, isPrivate);
      
      if (result.success && result.topicId) {
        setCreatedTopicId(result.topicId);
        toast({
          title: "Topic Created Successfully",
          description: `Topic created with ID: ${result.topicId}`,
        });
        setTopicMemo('');
      } else {
        toast({
          title: "Topic Creation Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create topic",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border shadow-medium max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="h-5 w-5" />
            <span>Create Topic</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topicMemo">Topic Memo/Description</Label>
            <Textarea
              id="topicMemo"
              placeholder="Describe your topic..."
              value={topicMemo}
              onChange={(e) => setTopicMemo(e.target.value)}
              className="bg-background min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="private-topic">Private Topic</Label>
              <p className="text-sm text-muted-foreground">
                Only you can submit messages to this topic
              </p>
            </div>
            <Switch
              id="private-topic"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <Button 
            onClick={handleCreateTopic}
            disabled={isLoading || !topicMemo}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Hash className="h-4 w-4 mr-2" />
                Create Topic
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {createdTopicId && (
        <Card className="bg-gradient-card border-border shadow-medium max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-success">Topic Created!</h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Topic ID:</p>
                <code className="text-sm font-mono">{createdTopicId}</code>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(`https://hashscan.io/testnet/topic/${createdTopicId}`, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on HashScan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}