import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label } from '../components/ui';
import { MapPin, Image as ImageIcon, Store, Clock, Phone, Globe, UploadCloud, CheckCircle2 } from 'lucide-react';

export function MapsSetup() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Google Maps Integration</h1>
        <p className="text-slate-500 mt-1">Get discovered by local customers when they search for places to eat.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Claim your business profile</h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm mt-1 mb-4">
            A verified Google Business Profile makes your business twice as likely to be considered reputable. Complete the form below to initiate the connection.
          </p>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white border-0">Connect with Google</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Details as they will appear on Maps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input id="business-name" defaultValue="Joe's Cafe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Primary Category</Label>
              <Input id="category" defaultValue="Coffee Shop" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="phone" className="pl-9" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="website" className="pl-9" defaultValue="https://thingintech.com/m/joes-cafe" readOnly />
              </div>
              <p className="text-xs text-slate-500">We automatically use your digital menu link.</p>
            </div>

            <div className="space-y-2">
              <Label>Business Hours</Label>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                Mon-Fri: 7am - 4pm • Sat-Sun: 8am - 3pm
              </div>
              <Button variant="outline" size="sm" className="mt-2">Edit Hours</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8 md:col-span-1">
          {/* Location Map Simulation */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Pinpoint your exact storefront</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Enter street address" className="pl-9" defaultValue="123 Main St, Downtown" />
                </div>
                
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-700">
                  {/* Map Mock */}
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=YOUR_API_KEY_HERE')] bg-cover bg-center opacity-50 grayscale mix-blend-multiply dark:mix-blend-screen"></div>
                  
                  {/* Interactive Pin Mock */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 animate-bounce cursor-pointer">
                    <MapPin className="w-8 h-8 text-red-500 fill-red-100 drop-shadow-lg" />
                    <div className="w-4 h-1 bg-black/20 blur-[2px] rounded-full mt-1 mx-auto"></div>
                  </div>
                  
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button className="w-8 h-8 bg-white text-slate-900 rounded shadow-sm flex items-center justify-center font-bold text-xl leading-none">+</button>
                    <button className="w-8 h-8 bg-white text-slate-900 rounded shadow-sm flex items-center justify-center font-bold text-xl leading-none">-</button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Add exterior and interior photos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Cafe exterior" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button variant="danger" size="sm" className="h-6 text-xs px-2">Remove</Button>
                  </div>
                </div>
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Coffee" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button variant="danger" size="sm" className="h-6 text-xs px-2">Remove</Button>
                  </div>
                </div>
                <div className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors">
                  <UploadCloud className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Add Photo</span>
                </div>
              </div>
              <Button variant="primary" className="w-full">Save Changes & Sync</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
