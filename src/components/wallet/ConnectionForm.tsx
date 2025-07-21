import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { useHederaAccount } from '@/hooks/useHederaAccount';

export function ConnectionForm() {
  const { connectAccount, isLoading, error } = useHederaAccount();
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !privateKey) return;
    
    await connectAccount(accountId, privateKey);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-gradient-card border-border shadow-medium animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Connect Hedera Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your account credentials to access your Hedera wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-sm font-medium">
                Account ID
              </Label>
              <Input
                id="accountId"
                type="text"
                placeholder="0.0.123456"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="bg-background border-border focus:ring-primary focus:border-primary transition-all duration-300"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="privateKey" className="text-sm font-medium">
                Private Key
              </Label>
              <div className="relative">
                <Input
                  id="privateKey"
                  type={showPrivateKey ? "text" : "password"}
                  placeholder="Enter your private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="bg-background border-border focus:ring-primary focus:border-primary transition-all duration-300 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                >
                  {showPrivateKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="border-destructive/50 text-destructive animate-fade-in">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading || !accountId || !privateKey}
              className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 shadow-medium hover:shadow-glow transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}