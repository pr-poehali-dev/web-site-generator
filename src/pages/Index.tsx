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
  createdAt: string;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentView, setCurrentView] = useState<'editor' | 'projects'>('editor');
  
  const [currentProject, setCurrentProject] = useState<Project>({
    id: Date.now().toString(),
    name: 'Мой первый сайт',
    html: '<h1>Привет, мир!</h1>\n<p>Начни создавать свой сайт здесь</p>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}',
    js: 'console.log("Сайт загружен!");',
    views: 0,
    createdAt: new Date().toLocaleString('ru-RU')
  });
  
  const [projects, setProjects] = useState<Project[]>([currentProject]);
  const [activeTab, setActiveTab] = useState('html');
  const [showPreview, setShowPreview] = useState(false);

  const handleAuth = () => {
    if (!email || !password) {
      toast.error('Заполните все поля!');
      return;
    }
    setIsAuthenticated(true);
    toast.success(isLogin ? 'С возвращением!' : 'Регистрация успешна!');
  };

  const handlePublish = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/01643e7f-12ef-427a-b186-826723d6e783', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': email || 'anonymous'
        },
        body: JSON.stringify({
          id: currentProject.id,
          name: currentProject.name,
          html: currentProject.html,
          css: currentProject.css,
          js: currentProject.js
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const publishedUrl = `https://functions.poehali.dev/01643e7f-12ef-427a-b186-826723d6e783/${currentProject.id}`;
        const updatedProject = { ...currentProject, publishedUrl };
        setCurrentProject(updatedProject);
        setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
        toast.success('Сайт опубликован! Ссылка скопирована');
        navigator.clipboard.writeText(publishedUrl);
      } else {
        toast.error('Ошибка публикации: ' + (data.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      console.error('Publish error:', error);
    }
  };

  const handleDownload = () => {
    const content = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentProject.name}</title>
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
    toast.success('Сайт скачан!');
  };

  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Новый проект ${projects.length + 1}`,
      html: '<h1>Новый проект</h1>\n<p>Начните здесь</p>',
      css: 'body { padding: 20px; font-family: Arial; }',
      js: '// Ваш JavaScript код',
      views: 0,
      createdAt: new Date().toLocaleString('ru-RU')
    };
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setCurrentView('editor');
    toast.success('Новый проект создан!');
  };

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('editor');
  };

  const deleteProject = (projectId: string) => {
    if (projects.length === 1) {
      toast.error('Нельзя удалить последний проект!');
      return;
    }
    const filtered = projects.filter(p => p.id !== projectId);
    setProjects(filtered);
    if (currentProject.id === projectId) {
      setCurrentProject(filtered[0]);
    }
    toast.success('Проект удален');
  };

  const getPreviewContent = () => {
    return `
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="UTF-8">
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
            <h1 className="text-3xl md:text-4xl font-black text-[#FFD700] retro-glow mb-2">
              PlutEditorSites
            </h1>
            <p className="text-sm text-[#DC143C] font-bold">Конструктор веб-сайтов</p>
            <Icon name="Code" className="mx-auto text-[#DC143C] float mt-4" size={48} />
          </div>
          
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border-2 border-[#FFD700] text-[#FFD700] placeholder:text-[#FFD700]/50"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black border-2 border-[#FFD700] text-[#FFD700] placeholder:text-[#FFD700]/50"
            />
            
            <Button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-[#DC143C] to-[#FFD700] text-black hover:opacity-90 font-bold py-6"
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-[#FFD700] hover:text-[#DC143C] transition-colors text-sm mt-4"
            >
              {isLogin ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (currentView === 'projects') {
    return (
      <div className="min-h-screen bg-black text-[#FFD700] p-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 pb-4 border-b-4 border-[#FFD700]">
            <h1 className="text-2xl md:text-4xl font-black retro-glow text-center mb-4">
              PlutEditorSites
            </h1>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => setCurrentView('editor')}
                className="bg-[#FFD700] text-black hover:bg-[#DC143C] hover:text-white font-bold"
              >
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                К редактору
              </Button>
              <Button
                onClick={createNewProject}
                className="bg-gradient-to-r from-[#DC143C] to-[#FFD700] text-black hover:opacity-90 font-bold"
              >
                <Icon name="Plus" size={20} className="mr-2" />
                Новый проект
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-black border-4 border-[#FFD700] p-4 hover:border-[#DC143C] transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-[#FFD700] font-bold text-lg">{project.name}</h3>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-[#DC143C] hover:text-white hover:bg-[#DC143C]"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                
                <p className="text-xs text-[#FFD700]/70 mb-3">
                  Создан: {project.createdAt}
                </p>
                
                {project.publishedUrl && (
                  <div className="mb-3 p-2 bg-black border border-[#DC143C]">
                    <p className="text-xs text-[#DC143C] flex items-center gap-1">
                      <Icon name="Eye" size={12} />
                      Просмотров: {project.views}
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={() => selectProject(project)}
                  className="w-full bg-gradient-to-r from-[#DC143C] to-[#FFD700] text-black hover:opacity-90 font-bold"
                >
                  Открыть
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FFD700] p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 pb-4 border-b-4 border-[#FFD700]">
          <h1 className="text-2xl md:text-4xl font-black retro-glow text-center mb-4">
            PlutEditorSites
          </h1>
          <p className="text-center text-sm text-[#FFD700]/70 mb-4">
            Редактируется: <span className="font-bold text-[#FFD700]">{currentProject.name}</span>
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-[#FFD700] text-black hover:bg-[#DC143C] hover:text-white transition-all font-bold"
            >
              <Icon name="Eye" size={20} className="mr-2" />
              Превью
            </Button>
            
            <Button
              onClick={handlePublish}
              className="bg-gradient-to-r from-[#DC143C] to-[#FFD700] text-black hover:opacity-90 font-bold"
            >
              <Icon name="Upload" size={20} className="mr-2" />
              Опубликовать
            </Button>
            
            <Button
              onClick={handleDownload}
              className="bg-[#DC143C] text-white hover:bg-[#FFD700] hover:text-black transition-all font-bold"
            >
              <Icon name="Download" size={20} className="mr-2" />
              Скачать
            </Button>
            
            <Button
              onClick={() => setCurrentView('projects')}
              className="bg-black border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-bold"
            >
              <Icon name="FolderOpen" size={20} className="mr-2" />
              Мои проекты
            </Button>
          </div>
          
          {currentProject.publishedUrl && (
            <div className="mt-4 p-3 bg-black border-2 border-[#FFD700]">
              <p className="text-sm text-[#FFD700] break-all mb-2">
                <Icon name="Link" size={14} className="inline mr-1" />
                Ссылка: {currentProject.publishedUrl}
              </p>
              <p className="text-sm text-[#DC143C]">
                <Icon name="Eye" size={14} className="inline mr-1" />
                Просмотров: {currentProject.views}
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
                  className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700] font-bold"
                >
                  HTML
                </TabsTrigger>
                <TabsTrigger 
                  value="css"
                  className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700] font-bold"
                >
                  CSS
                </TabsTrigger>
                <TabsTrigger 
                  value="js"
                  className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700] font-bold"
                >
                  JavaScript
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html">
                <Textarea
                  value={currentProject.html}
                  onChange={(e) => setCurrentProject({ ...currentProject, html: e.target.value })}
                  className="min-h-[500px] bg-black border-2 border-[#FFD700] text-[#FFD700] font-mono"
                  placeholder="HTML код..."
                />
              </TabsContent>

              <TabsContent value="css">
                <Textarea
                  value={currentProject.css}
                  onChange={(e) => setCurrentProject({ ...currentProject, css: e.target.value })}
                  className="min-h-[500px] bg-black border-2 border-[#FFD700] text-[#FFD700] font-mono"
                  placeholder="CSS код..."
                />
              </TabsContent>

              <TabsContent value="js">
                <Textarea
                  value={currentProject.js}
                  onChange={(e) => setCurrentProject({ ...currentProject, js: e.target.value })}
                  className="min-h-[500px] bg-black border-2 border-[#FFD700] text-[#FFD700] font-mono"
                  placeholder="JavaScript код..."
                />
              </TabsContent>
            </Tabs>
          </Card>

          {showPreview && (
            <Card className="bg-white border-4 border-[#DC143C] p-0 overflow-hidden">
              <div className="bg-black border-b-2 border-[#DC143C] p-2">
                <p className="text-[#FFD700] text-sm text-center font-bold">
                  ЖИВОЕ ПРЕВЬЮ
                </p>
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
          <div className="inline-flex items-center gap-2 text-sm text-[#DC143C] font-bold">
            <Icon name="Zap" size={20} className="float" />
            <span>СОЗДАНО НА POEHALI.DEV</span>
            <Icon name="Zap" size={20} className="float" />
          </div>
        </div>
      </div>
    </div>
  );
}