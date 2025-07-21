import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coins, Send, Loader2 } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { toast } from '@/hooks/use-toast';

export function TokenManager() {
  const { account, sendToken } = useHederaAccount();
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendToken = async () => {
    if (!selectedTokenId || !recipientId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please provide token, recipient, and amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendToken(recipientId, selectedTokenId, amount);
      
      if (result.success) {
        toast({
          title: "Token Transfer Successful",
          description: `${amount} tokens sent to ${recipientId}`,
        });
        setRecipientId('');
        setAmount('');
        setSelectedTokenId('');
      } else {
        toast({
          title: "Token Transfer Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send token",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!account?.tokens || account.tokens.length === 0) {
    return (
      <Card className="bg-gradient-card border-border shadow-medium max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
          <p className="text-muted-foreground">
            You don't have any associated tokens yet. Create or associate tokens to manage them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Holdings */}
      <Card className="bg-gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Your Tokens</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {account.tokens.map((token, index) => (
              <div
                key={token.tokenId}
                className="flex items-center justify-between p-3 bg-muted rounded-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <p className="font-medium">{token.symbol || token.tokenId}</p>
                  <p className="text-sm text-muted-foreground">{token.name || 'Unknown Token'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{token.balance}</p>
                  <p className="text-xs text-muted-foreground">{token.tokenId}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Tokens */}
      <Card className="bg-gradient-card border-border shadow-medium max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send Tokens</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token-select">Select Token</Label>
            <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose a token" />
              </SelectTrigger>
              <SelectContent>
                {account.tokens.map((token) => (
                  <SelectItem key={token.tokenId} value={token.tokenId}>
                    {token.symbol || token.tokenId} (Balance: {token.balance})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background"
            />
          </div>

          <Button 
            onClick={handleSendToken}
            disabled={isLoading || !selectedTokenId || !recipientId || !amount}
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
                Send Tokens
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}