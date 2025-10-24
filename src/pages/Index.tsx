import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  views: number;
  publishedUrl?: string;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [currentProject, setCurrentProject] = useState<Project>({
    id: Date.now().toString(),
    name: 'My First Site',
    html: '<h1>Hello World!</h1>\n<p>Start building your site here</p>',
    css: 'body {\n  font-family: Arial;\n  padding: 20px;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}',
    js: 'console.log("Site loaded!");',
    views: 0
  });
  
  const [projects, setProjects] = useState<Project[]>([currentProject]);
  const [activeTab, setActiveTab] = useState('html');
  const [showPreview, setShowPreview] = useState(false);

  const handleAuth = () => {
    if (!email || !password) {
      toast.error('Fill all fields!');
      return;
    }
    setIsAuthenticated(true);
    toast.success(isLogin ? 'Welcome back!' : 'Registration successful!');
  };

  const handlePublish = () => {
    const publishedUrl = `https://poehali.dev/${currentProject.id}`;
    setCurrentProject({ ...currentProject, publishedUrl });
    setProjects(projects.map(p => p.id === currentProject.id ? { ...p, publishedUrl } : p));
    toast.success('Site published successfully!');
    navigator.clipboard.writeText(publishedUrl);
  };

  const handleDownload = () => {
    const content = `<!DOCTYPE html>
<html>
<head>
  <style>${currentProject.css}</style>
</head>
<body>
  ${currentProject.html}
  <script>${currentProject.js}</script>
</body>
</html>`;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.html`;
    a.click();
    toast.success('Site downloaded!');
  };

  const getPreviewContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${currentProject.css}</style>
        </head>
        <body>
          ${currentProject.html}
          <script>${currentProject.js}</script>
        </body>
      </html>
    `;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 retro-gradient">
        <Card className="w-full max-w-md p-8 bg-black border-4 border-[#FFD700]">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl text-[#FFD700] retro-glow mb-4 break-words">
              WEBSITE CONSTRUCTOR
            </h1>
            <Icon name="Code" className="mx-auto text-[#DC143C] float" size={48} />
          </div>
          
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border-2 border-[#FFD700] text-[#FFD700] placeholder:text-[#FFD700]/50 text-sm"
            />
            <Input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black border-2 border-[#FFD700] text-[#FFD700] placeholder:text-[#FFD700]/50 text-sm"
            />
            
            <Button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-[#DC143C] to-[#FFD700] text-black hover:opacity-90 shake-on-hover font-bold text-sm py-6"
            >
              {isLogin ? 'ENTER' : 'REGISTER'}
            </Button>
            
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-[#FFD700] hover:text-[#DC143C] transition-colors text-xs mt-4"
            >
              {isLogin ? 'No account? Register' : 'Have account? Login'}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FFD700] p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 pb-4 border-b-4 border-[#FFD700]">
          <h1 className="text-xl md:text-3xl retro-glow text-center mb-6 break-words">
            WEBSITE CONSTRUCTOR
          </h1>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-[#FFD700] text-black hover:bg-[#DC143C] hover:text-white transition-all text-xs px-4 py-2"
            >
              <Icon name="Eye" size={16} className="mr-2" />
              PREVIEW
            </Button>
            
            <Button
              onClick={handlePublish}
              className="bg-gradient-to-r from-[#DC143C] to-[#FFD700] text-black hover:opacity-90 text-xs px-4 py-2"
            >
              <Icon name="Upload" size={16} className="mr-2" />
              PUBLISH
            </Button>
            
            <Button
              onClick={handleDownload}
              className="bg-[#DC143C] text-white hover:bg-[#FFD700] hover:text-black transition-all text-xs px-4 py-2"
            >
              <Icon name="Download" size={16} className="mr-2" />
              DOWNLOAD
            </Button>
          </div>
          
          {currentProject.publishedUrl && (
            <div className="mt-4 p-3 bg-black border-2 border-[#FFD700] text-center">
              <p className="text-xs text-[#FFD700] break-all mb-2">
                LINK: {currentProject.publishedUrl}
              </p>
              <p className="text-xs text-[#DC143C]">
                <Icon name="Eye" size={12} className="inline mr-1" />
                VIEWS: {currentProject.views}
              </p>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-black border-4 border-[#FFD700] p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-black border-2 border-[#DC143C] grid grid-cols-3 mb-4">
                <TabsTrigger 
                  value="html"
                  className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700] text-xs"
                >
                  HTML
                </TabsTrigger>
                <TabsTrigger 
                  value="css"
                  className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700] text-xs"
                >
                  CSS
                </TabsTrigger>
                <TabsTrigger 
                  value="js"
                  className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700] text-xs"
                >
                  JS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html">
                <Textarea
                  value={currentProject.html}
                  onChange={(e) => setCurrentProject({ ...currentProject, html: e.target.value })}
                  className="min-h-[500px] bg-black border-2 border-[#FFD700] text-[#FFD700] font-mono text-sm"
                  placeholder="HTML code..."
                />
              </TabsContent>

              <TabsContent value="css">
                <Textarea
                  value={currentProject.css}
                  onChange={(e) => setCurrentProject({ ...currentProject, css: e.target.value })}
                  className="min-h-[500px] bg-black border-2 border-[#FFD700] text-[#FFD700] font-mono text-sm"
                  placeholder="CSS code..."
                />
              </TabsContent>

              <TabsContent value="js">
                <Textarea
                  value={currentProject.js}
                  onChange={(e) => setCurrentProject({ ...currentProject, js: e.target.value })}
                  className="min-h-[500px] bg-black border-2 border-[#FFD700] text-[#FFD700] font-mono text-sm"
                  placeholder="JavaScript code..."
                />
              </TabsContent>
            </Tabs>
          </Card>

          {showPreview && (
            <Card className="bg-white border-4 border-[#DC143C] p-0 overflow-hidden">
              <div className="bg-black border-b-2 border-[#DC143C] p-2">
                <p className="text-[#FFD700] text-xs text-center">LIVE PREVIEW</p>
              </div>
              <iframe
                srcDoc={getPreviewContent()}
                className="w-full h-[600px] bg-white"
                title="preview"
                sandbox="allow-scripts"
              />
            </Card>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-[#DC143C]">
            <Icon name="Zap" size={16} className="float" />
            <span>POWERED BY POEHALI.DEV</span>
            <Icon name="Zap" size={16} className="float" />
          </div>
        </div>
      </div>
    </div>
  );
}
