import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { toast } from '@/hooks/use-toast';

export function SendHbar() {
  const { sendHbar } = useHederaAccount();
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!recipientId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please provide both recipient ID and amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendHbar(recipientId, amount);
      
      if (result.success) {
        toast({
          title: "Transaction Successful",
          description: `${amount} HBAR sent to ${recipientId}`,
        });
        setRecipientId('');
        setAmount('');
      } else {
        toast({
          title: "Transaction Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send HBAR",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border shadow-medium max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Send HBAR</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Account ID</Label>
          <Input
            id="recipient"
            placeholder="0.0.xxxxx"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="bg-background"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (HBAR)</Label>
          <Input
            id="amount"
            type="number"
            step="0.00000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background"
          />
        </div>

        <Button 
          onClick={handleSend}
          disabled={isLoading || !recipientId || !amount}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send HBAR
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}