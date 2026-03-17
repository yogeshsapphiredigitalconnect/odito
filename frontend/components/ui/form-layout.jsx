"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import apiService from "@/lib/apiService";

export default function NewProjectForm() {
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    project_name: "",
    business_type: "",
    website_url: "",
    industry: "",
    scrape_frequency: "weekly",
    location: "",
    country: "US",
    language: "en",
    description: ""
  });
  const router = useRouter();

  const handleAddKeyword = () => {
    if (keywordInput.trim() !== "") {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
  };

  const handleKeywordInputChange = (e) => {
    setKeywordInput(e.target.value);
  };

  const handleKeywordInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleAddKeyword();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (keywords.length === 0) {
      alert("Please add at least one keyword");
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        project_name: formData.project_name,
        main_url: formData.website_url,
        keywords: keywords,
        business_type: formData.business_type,
        industry: formData.industry,
        location: formData.location,
        country: formData.country,
        language: formData.language,
        description: formData.description,
        scrape_frequency: formData.scrape_frequency
      };

      const response = await apiService.createProject(projectData);

      console.log('Project created successfully:', response);
      alert('Project created successfully!');
      router.push('/projects');
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-3">
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Create New SEO Project
        </h3>

        {/* Project Name and Business Type - Side by side */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="project-name" className="font-medium">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="project-name" 
              name="project-name" 
              className="mt-2" 
              placeholder="Enter project name"
              value={formData.project_name}
              onChange={(e) => handleInputChange('project_name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="business-type" className="font-medium">
              Business Type <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="business-type" 
              name="business-type" 
              className="mt-2" 
              placeholder="Enter business type"
              value={formData.business_type}
              onChange={(e) => handleInputChange('business_type', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Website URL - Full width */}
        <div>
          <Label htmlFor="website-url" className="font-medium">
            Website URL <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="website-url" 
            name="website-url" 
            className="mt-2" 
            placeholder="https://example.com" 
            type="url"
            value={formData.website_url}
            onChange={(e) => handleInputChange('website_url', e.target.value)}
            required
          />
        </div>

        {/* Keywords - Full width with add button */}
        <div>
          <Label htmlFor="keywords" className="font-medium">
            Keywords <span className="text-red-500">*</span>
          </Label>
          <div className="relative flex items-center mt-2">
            <Input 
              id="keywords" 
              name="keywords" 
              className="pr-12" 
              placeholder="Enter keywords separated by commas or press Enter"
              value={keywordInput}
              onChange={handleKeywordInputChange}
              onKeyPress={handleKeywordInputKeyPress}
            />
            <Button 
              type="button" 
              className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 h-8 w-8 p-0"
              onClick={handleAddKeyword}
            >
              +
            </Button>
          </div>
          
          {/* Display keywords as tags */}
          {keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-1 hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industry and Scrape Frequency - Side by side */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="industry" className="font-medium">
              Industry
            </Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
              <SelectTrigger id="industry" name="industry" className="mt-2">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="scrape-frequency" className="font-medium">
              Scrape Frequency
            </Label>
            <Select value={formData.scrape_frequency} onValueChange={(value) => handleInputChange('scrape_frequency', value)}>
              <SelectTrigger id="scrape-frequency" name="scrape-frequency" className="mt-2">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location, Country, Language - Three columns */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="location" className="font-medium">
              Location
            </Label>
            <Input 
              id="location" 
              name="location" 
              className="mt-2" 
              placeholder="Enter location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country" className="font-medium">
              Country
            </Label>
            <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger id="country" name="country" className="mt-2">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="ES">Spain</SelectItem>
                <SelectItem value="IT">Italy</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
                <SelectItem value="CN">China</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="BR">Brazil</SelectItem>
                <SelectItem value="MX">Mexico</SelectItem>
                <SelectItem value="KR">South Korea</SelectItem>
                <SelectItem value="RU">Russia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="language" className="font-medium">
              Language
            </Label>
            <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
              <SelectTrigger id="language" name="language" className="mt-2">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description - Full width with textarea */}
        <div>
          <Label htmlFor="description" className="font-medium">
            Description
          </Label>
          <Textarea 
            id="description" 
            name="description" 
            className="mt-2" 
            placeholder="Enter project description..." 
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <Separator className="my-8" />

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push('/projects/all')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
