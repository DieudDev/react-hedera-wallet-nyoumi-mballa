import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2, RefreshCw } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { toast } from '@/hooks/use-toast';
import { TopicMessageQuery, TopicId } from '@hashgraph/sdk';
import { TopicMessage } from '@/types/hedera';

export function MessageManager() {
  const { sendTopicMessage, client } = useHederaAccount();
  const [topicId, setTopicId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<TopicMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSendMessage = async () => {
    if (!topicId || !message) {
      toast({
        title: "Missing Information",
        description: "Please provide topic ID and message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendTopicMessage(topicId, message);
      
      if (result.success) {
        toast({
          title: "Message Sent",
          description: `Message sent to topic ${topicId}`,
        });
        setMessage('');
        // Refresh messages after sending
        setTimeout(() => fetchMessages(), 2000);
      } else {
        toast({
          title: "Message Send Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!topicId || !client) return;

    setIsLoadingMessages(true);
    try {
      const query = new TopicMessageQuery()
        .setTopicId(TopicId.fromString(topicId))
        .setStartTime(0);

      const fetchedMessages: TopicMessage[] = [];
      
      await query.subscribe(client, null, (message) => {
        fetchedMessages.push({
          sequenceNumber: message.sequenceNumber.toNumber(),
          contents: new TextDecoder().decode(message.contents),
          timestamp: new Date(message.consensusTimestamp.toDate()).toISOString(),
          consensusTimestamp: message.consensusTimestamp.toString()
        });
      });

      // Wait a bit for messages to be collected
      setTimeout(() => {
        setMessages(fetchedMessages.sort((a, b) => a.sequenceNumber - b.sequenceNumber));
        setIsLoadingMessages(false);
      }, 3000);

    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast({
        title: "Error",
        description: "Failed to fetch topic messages",
        variant: "destructive"
      });
      setIsLoadingMessages(false);
    }
  };

  const subscribeToTopic = async () => {
    if (!topicId || !client) return;

    try {
      setIsSubscribed(true);
      const query = new TopicMessageQuery()
        .setTopicId(TopicId.fromString(topicId))
        .setStartTime(Date.now());

      query.subscribe(client, null, (message) => {
        const newMessage: TopicMessage = {
          sequenceNumber: message.sequenceNumber.toNumber(),
          contents: new TextDecoder().decode(message.contents),
          timestamp: new Date(message.consensusTimestamp.toDate()).toISOString(),
          consensusTimestamp: message.consensusTimestamp.toString()
        };

        setMessages(prev => [...prev, newMessage].sort((a, b) => a.sequenceNumber - b.sequenceNumber));
        
        toast({
          title: "New Message",
          description: `New message received in topic ${topicId}`,
        });
      });

      toast({
        title: "Subscribed",
        description: `Now listening for new messages in topic ${topicId}`,
      });

    } catch (err) {
      console.error('Failed to subscribe to topic:', err);
      toast({
        title: "Subscription Failed",
        description: "Failed to subscribe to topic messages",
        variant: "destructive"
      });
      setIsSubscribed(false);
    }
  };

  useEffect(() => {
    if (topicId && client && !isSubscribed) {
      fetchMessages();
    }
  }, [topicId, client]);

  return (
    <div className="space-y-6">
      {/* Send Message */}
      <Card className="bg-gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send Message to Topic</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topicId">Topic ID</Label>
            <Input
              id="topicId"
              placeholder="0.0.xxxxx"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background min-h-[100px]"
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !topicId || !message}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>

            {topicId && !isSubscribed && (
              <Button 
                onClick={subscribeToTopic}
                variant="outline"
                className="flex-shrink-0"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Display */}
      {topicId && (
        <Card className="bg-gradient-card border-border shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Topic Messages</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {isSubscribed && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm text-success">Live</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchMessages}
                  disabled={isLoadingMessages}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={`${msg.sequenceNumber}-${msg.consensusTimestamp}`}
                      className="p-3 bg-muted rounded-lg space-y-2 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Sequence #{msg.sequenceNumber}</span>
                        <span>{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm break-words">{msg.contents}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages found in this topic</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}