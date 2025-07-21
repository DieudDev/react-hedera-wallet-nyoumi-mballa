import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionForm } from './ConnectionForm';
import { AccountOverview } from './AccountOverview';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { 
  Send, 
  Coins, 
  Plus, 
  Link, 
  MessageSquare, 
  Hash,
  Activity,
  Wallet
} from 'lucide-react';

export function Dashboard() {
  const { account } = useHederaAccount();
  const [activeTab, setActiveTab] = useState('overview');

  if (!account) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center space-y-8 max-w-2xl mx-auto">
            <div className="space-y-4 animate-fade-in">
              <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Hedera Wallet
              </h1>
              <p className="text-xl text-muted-foreground">
                Professional blockchain wallet for the Hedera network
              </p>
            </div>
            
            <ConnectionForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Hedera Wallet
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-7 bg-muted p-1 h-auto">
            <TabsTrigger 
              value="overview" 
              className="flex items-center space-x-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all duration-300"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="send-hbar" 
              className="flex items-center space-x-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all duration-300"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send HBAR</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tokens" 
              className="flex items-center space-x-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all duration-300"
            >
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Tokens</span>
            </TabsTrigger>
            <TabsTrigger 
              value="create-token" 
              className="flex items-center space-x-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger 
              value="associate" 
              className="flex items-center space-x-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all duration-300"
            >
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Associate</span>
            </TabsTrigger>
            <TabsTrigger 
              value="topics" 
              className="flex items-center space-x-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all duration-300"
            >
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Topics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="flex items-center space-x-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="animate-fade-in">
            <TabsContent value="overview" className="space-y-6">
              <AccountOverview />
            </TabsContent>

            <TabsContent value="send-hbar" className="space-y-6">
              <div className="text-center py-12">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Send HBAR</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-6">
              <div className="text-center py-12">
                <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Token Management</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="create-token" className="space-y-6">
              <div className="text-center py-12">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create Token</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="associate" className="space-y-6">
              <div className="text-center py-12">
                <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Associate Token</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="topics" className="space-y-6">
              <div className="text-center py-12">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Topics</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Messages</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}