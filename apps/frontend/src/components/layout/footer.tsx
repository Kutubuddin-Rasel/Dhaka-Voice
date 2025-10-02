export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">DV</span>
              </div>
              <span className="font-bold">DhakaVoice</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering citizens to voice their concerns and improve Dhaka together.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Submit complaint</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Browse complaints</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 DhakaVoice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
