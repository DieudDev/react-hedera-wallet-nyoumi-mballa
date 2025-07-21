import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, ExternalLink } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { toast } from '@/hooks/use-toast';

export function CreateToken() {
  const { createToken } = useHederaAccount();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdTokenId, setCreatedTokenId] = useState('');

  const handleCreate = async () => {
    if (!tokenName || !tokenSymbol || !initialSupply) {
      toast({
        title: "Missing Information",
        description: "Please provide token name, symbol, and initial supply",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createToken(tokenName, tokenSymbol, initialSupply);
      
      if (result.success && result.tokenId) {
        setCreatedTokenId(result.tokenId);
        toast({
          title: "Token Created Successfully",
          description: `Token ${tokenSymbol} created with ID: ${result.tokenId}`,
        });
        setTokenName('');
        setTokenSymbol('');
        setInitialSupply('');
      } else {
        toast({
          title: "Token Creation Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create token",
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
            <Plus className="h-5 w-5" />
            <span>Create Fungible Token</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              placeholder="My Token"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              placeholder="MTK"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialSupply">Initial Supply</Label>
            <Input
              id="initialSupply"
              type="number"
              placeholder="1000"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              className="bg-background"
            />
          </div>

          <Button 
            onClick={handleCreate}
            disabled={isLoading || !tokenName || !tokenSymbol || !initialSupply}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Token
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {createdTokenId && (
        <Card className="bg-gradient-card border-border shadow-medium max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-success">Token Created!</h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Token ID:</p>
                <code className="text-sm font-mono">{createdTokenId}</code>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(`https://hashscan.io/testnet/token/${createdTokenId}`, '_blank')}
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