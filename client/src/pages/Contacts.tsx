import React, { useEffect, useState, useRef } from "react";
import { mockApi, Contact } from "@/src/api/mockApi";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Plus, Search, Trash2, Upload, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const data = await mockApi.contacts.getAll();
    setContacts(data);
  };

  const handleDelete = async (id: string) => {
    await mockApi.contacts.delete(id);
    loadContacts();
  };

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(search.toLowerCase()) || 
    c.firstName.toLowerCase().includes(search.toLowerCase())
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      // Assuming CSV format: email,firstName,lastName
      // Skip header row if it exists (checking if first row contains 'email' or '@' is missing)
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;
      
      const newContacts: Omit<Contact, 'id' | 'addedAt'>[] = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const [email, firstName = '', lastName = ''] = lines[i].split(',').map(s => s.trim());
        if (email && email.includes('@')) {
          newContacts.push({
            email,
            firstName,
            lastName,
            status: 'active'
          });
        }
      }

      if (newContacts.length > 0) {
        await mockApi.contacts.bulkAdd(newContacts);
        await loadContacts();
      }
    } catch (error) {
      console.error("Failed to import contacts:", error);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-gray-500">Manage your email subscribers.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-brand-950 rounded-xl border border-brand-100 dark:border-brand-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-100 dark:border-brand-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search contacts..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-brand-50 dark:bg-brand-900 border-b border-brand-100 dark:border-brand-800">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Added</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-brand-100 dark:border-brand-800 last:border-0 hover:bg-brand-50/50 dark:hover:bg-brand-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-900 dark:text-brand-50">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{contact.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contact.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {format(new Date(contact.addedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
                      <Trash2 className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
