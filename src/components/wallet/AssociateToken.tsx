import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, Loader2 } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { toast } from '@/hooks/use-toast';

export function AssociateToken() {
  const { associateToken } = useHederaAccount();
  const [tokenId, setTokenId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAssociate = async () => {
    if (!tokenId) {
      toast({
        title: "Missing Information",
        description: "Please provide a token ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await associateToken(tokenId);
      
      if (result.success) {
        toast({
          title: "Association Successful",
          description: `Account associated with token ${tokenId}`,
        });
        setTokenId('');
      } else {
        toast({
          title: "Association Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to associate token",
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
          <Link className="h-5 w-5" />
          <span>Associate Token</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tokenId">Token ID</Label>
          <Input
            id="tokenId"
            placeholder="0.0.xxxxx"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="bg-background"
          />
          <p className="text-sm text-muted-foreground">
            You must associate your account with a token before you can receive it.
          </p>
        </div>

        <Button 
          onClick={handleAssociate}
          disabled={isLoading || !tokenId}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Associating...
            </>
          ) : (
            <>
              <Link className="h-4 w-4 mr-2" />
              Associate Token
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}