"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintsApi } from '@/lib/api';
import { searchThanas, getWards, Thana, Ward } from '@/lib/locations';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Upload, X, MapPin, FileText, Camera } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters').max(120, 'Title must be less than 120 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  type: z.enum(['ROADS','ELECTRICITY','WATER','POLLUTION','TRANSPORT','OTHERS']),
  thanaId: z.number().int().positive().optional(),
  wardId: z.number().int().positive().optional(),
  files: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

const complaintTypes = [
  { value: 'ROADS', label: 'Roads & Infrastructure', icon: '🛣️' },
  { value: 'ELECTRICITY', label: 'Electricity', icon: '⚡' },
  { value: 'WATER', label: 'Water Supply', icon: '💧' },
  { value: 'POLLUTION', label: 'Pollution', icon: '🌫️' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚌' },
  { value: 'OTHERS', label: 'Others', icon: '📋' },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function NewComplaintPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, setError: setFormError } = useForm<FormValues>({ 
    resolver: zodResolver(schema) 
  });
  const [error, setError] = useState<string | null>(null);
  const [thanas, setThanas] = useState<Thana[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [thanaQuery, setThanaQuery] = useState('');
  const [corpFilter, setCorpFilter] = useState<'DNCC' | 'DSCC' | ''>('');
  const selectedWardId = watch('wardId');
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const previewsRef = useRef<string[]>([]);

  // Guard: require auth
  useEffect(() => {
    const user = authStore.get().user;
    if (!user) {
      router.replace('/login?next=/complaints/new');
    }
  }, [router]);

  // Load thanas
  useEffect(() => {
    let active = true;
    (async () => {
      const items = await searchThanas(thanaQuery || undefined);
      if (active) setThanas(items);
    })();
    return () => { active = false; };
  }, [thanaQuery]);

  // Load wards
  useEffect(() => {
    let active = true;
    (async () => {
      const items = await getWards(corpFilter || undefined);
      if (active) setWards(items);
    })();
    return () => { active = false; };
  }, [corpFilter]);

  // Handle file changes for previews and client-side validation
  useEffect(() => {
    // Clean up previous previews
    previewsRef.current.forEach(URL.revokeObjectURL);
    previewsRef.current = [];

    if (files && files.length > 0) {
      const newPreviews: string[] = [];
      const fileErrors: string[] = [];
      Array.from(files).forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          fileErrors.push(`File ${file.name} is too large (max 4MB).`);
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          fileErrors.push(`File ${file.name} has an unsupported type. Only JPG, PNG, WebP are allowed.`);
        }
        newPreviews.push(URL.createObjectURL(file));
      });

      if (fileErrors.length > 0) {
        setFormError('files', { type: 'manual', message: fileErrors.join(' ') });
        setPreviews([]);
      } else {
        setPreviews(newPreviews);
        previewsRef.current = newPreviews;
      }
    } else {
      setPreviews([]);
    }
  }, [files, setFormError]);

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      previewsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const created = await complaintsApi.create(values);
      if (files && files.length > 0 && !errors.files) {
        await complaintsApi.uploadImages(created.id, files);
      }
      window.location.href = `/complaints/${created.id}`;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg = err?.response?.data?.message || err?.message || 'Failed to create complaint. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const removeImage = (index: number) => {
    if (files) {
      const dt = new DataTransfer();
      Array.from(files).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setFiles(dt.files);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Submit a New Complaint</h1>
          <p className="text-xl text-muted-foreground">Help make Dhaka better by reporting civic issues in your area.</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Complaint Details
            </CardTitle>
            <CardDescription>
              Provide detailed information about the issue you&apos;re reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Title */}
              <Field label="Complaint Title *" error={errors.title?.message} hint="Brief, descriptive title for your complaint">
                <Input 
                  id="title" 
                  placeholder="e.g., Pothole on Mirpur Road near Dhanmondi" 
                  {...register('title')} 
                />
              </Field>

              {/* Category */}
              <Field label="Category *" error={errors.type?.message} hint="Select the most appropriate category for your complaint">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {complaintTypes.map((type) => (
                    <label key={type.value} className="relative">
                      <input
                        type="radio"
                        value={type.value}
                        {...register('type')}
                        className="sr-only peer"
                      />
                      <div className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-2 peer-checked:ring-primary/20">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>

              {/* Description */}
              <Field label="Description *" error={errors.description?.message} hint="Provide detailed information about the issue, including location, impact, and any other relevant details">
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail. Include specific location information, when you first noticed it, how it affects you and others, and any other relevant details that would help authorities understand and address the problem."
                  rows={6}
                  {...register('description')}
                />
              </Field>

              {/* Location */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Location Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Thana" hint="Search and select your police station area">
                    <div className="relative">
                      <Input
                        placeholder="Search thana..."
                        value={thanaQuery}
                        onChange={(e) => setThanaQuery(e.target.value)}
                        className="pr-10"
                      />
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      {thanaQuery && thanas.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                          {thanas.map((thana) => (
                            <button
                              key={thana.id}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                              onClick={() => {
                                setValue('thanaId', thana.id);
                                setThanaQuery(thana.name);
                              }}
                            >
                              {thana.name}
                            </button>
                          ))}
                          {thanas.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
                          )}
                        </div>
                      )}
                      <input type="hidden" {...register('thanaId', { valueAsNumber: true })} />
                    </div>
                  </Field>

                  <Field label="Ward" hint="Select your city corporation ward">
                    <div className="space-y-3">
                      <Select value={corpFilter} onChange={(e) => setCorpFilter((e.target.value as 'DNCC' | 'DSCC' | '') || '')}>
                        <option value="">Select City Corporation</option>
                        <option value="DNCC">Dhaka North City Corporation (DNCC)</option>
                        <option value="DSCC">Dhaka South City Corporation (DSCC)</option>
                      </Select>
                      <Select
                        value={selectedWardId ? String(selectedWardId) : ''}
                        onChange={(e) => setValue('wardId', e.target.value ? Number(e.target.value) : undefined)}
                        disabled={!corpFilter}
                      >
                        <option value="">Select ward</option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            Ward {w.wardNumber} ({w.cityCorporation})
                          </option>
                        ))}
                      </Select>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Images */}
              <Field label="Supporting Images (Optional)" hint="Upload up to 3 images to support your complaint. Max 4MB per image. Supported formats: JPG, PNG, WebP">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Camera className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Click to upload images</p>
                          <p className="text-sm text-muted-foreground">or drag and drop files here</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {previews.map((src, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={src} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="sm:flex-1 h-12 text-lg"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Complaint
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild className="sm:w-auto h-12">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}