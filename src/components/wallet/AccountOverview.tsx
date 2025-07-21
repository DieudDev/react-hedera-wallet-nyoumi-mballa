import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy, LogOut, Coins, RefreshCw } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { toast } from '@/hooks/use-toast';

export function AccountOverview() {
  const { account, clearAccount, refreshAccountInfo, isLoading } = useHederaAccount();

  if (!account) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Account ID copied successfully",
    });
  };

  const handleRefresh = async () => {
    try {
      await refreshAccountInfo();
      toast({
        title: "Refreshed",
        description: "Account information updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh account information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <Card className="bg-gradient-card border-border shadow-medium">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Hedera Account</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {account.accountId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.accountId)}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="hover:bg-muted transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAccount}
                className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Balance Card */}
      <Card className="bg-gradient-card border-border shadow-medium">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">HBAR Balance</p>
              <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {account.balance} ℏ
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
              <Coins className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tokens */}
      {account.tokens.length > 0 && (
        <Card className="bg-gradient-card border-border shadow-medium">
          <CardHeader>
            <CardTitle className="text-lg">Token Holdings</CardTitle>
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
                    <Badge variant="secondary" className="text-xs">
                      {token.tokenId}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}