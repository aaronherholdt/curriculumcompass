import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, X, ChevronLeft, ChevronRight } from 'lucide-react';
import worksheetGenerator, { WORKSHEET_TYPES } from '../utils/worksheetGenerator';
import worksheetService from '../services/worksheetService';

/**
 * WorksheetPreview Component
 * 
 * Displays a preview of generated worksheets with options to print or download
 */
const WorksheetPreview = ({ 
  resources, 
  childName, 
  grade, 
  onClose,
  isOpen 
}) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [worksheetType, setWorksheetType] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Reset when resources change
  useEffect(() => {
    if (resources && resources.length > 0) {
      setCurrentIndex(0);
      setSelectedResource(resources[0]);
      
      // Determine appropriate worksheet type based on subject and grade
      const subject = resources[0].subject || '';
      const appropriateTypes = worksheetGenerator.getWorksheetTypesBySubject(subject, grade);
      setWorksheetType(appropriateTypes[0]);
      
      // Fetch content for the first resource if it has a URL and no contentText
      if (resources[0].url && !resources[0].contentText) {
        fetchResourceContent(resources[0]);
      }
    }
  }, [resources, grade]);

  // Clean up PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Fetch content for a resource
  const fetchResourceContent = async (resource) => {
    if (!resource.url || resource.contentText) return;
    
    try {
      setIsFetchingContent(true);
      const response = await worksheetService.fetchResourceContent(resource.url);
      
      if (response.success) {
        // Update the selected resource with the fetched content
        setSelectedResource(prevResource => ({
          ...prevResource,
          contentText: response.contentText,
          source: response.source || prevResource.source
        }));
        
        // Also update the resource in the resources array
        const updatedResources = resources.map(r => 
          r.url === resource.url ? { ...r, contentText: response.contentText, source: response.source || r.source } : r
        );
        
        // Note: We're not updating the parent's resources state here as that might cause issues
        // The contentText will persist in our local state for this session
      }
    } catch (error) {
      console.error('Error fetching resource content:', error);
    } finally {
      setIsFetchingContent(false);
    }
  };

  // Handle resource navigation
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const newResource = resources[newIndex];
      setCurrentIndex(newIndex);
      setSelectedResource(newResource);
      
      // Update worksheet type based on new resource
      const subject = newResource.subject || '';
      const appropriateTypes = worksheetGenerator.getWorksheetTypesBySubject(subject, grade);
      setWorksheetType(appropriateTypes[0]);
      
      // Clear previous PDF
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      
      // Fetch content for the resource if needed
      if (newResource.url && !newResource.contentText) {
        fetchResourceContent(newResource);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < resources.length - 1) {
      const newIndex = currentIndex + 1;
      const newResource = resources[newIndex];
      setCurrentIndex(newIndex);
      setSelectedResource(newResource);
      
      // Update worksheet type based on new resource
      const subject = newResource.subject || '';
      const appropriateTypes = worksheetGenerator.getWorksheetTypesBySubject(subject, grade);
      setWorksheetType(appropriateTypes[0]);
      
      // Clear previous PDF
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      
      // Fetch content for the resource if needed
      if (newResource.url && !newResource.contentText) {
        fetchResourceContent(newResource);
      }
    }
  };

  // Generate PDF for current resource
  const generatePDF = () => {
    if (!selectedResource || !worksheetType) return;
    
    setIsGenerating(true);
    
    try {
      // Ensure contentText is available (or default to description)
      const resourceWithContent = {
        ...selectedResource,
        contentText: selectedResource.contentText || selectedResource.description
      };
      
      // Use the worksheet service instead of direct fetch
      worksheetService.generateWorksheet(resourceWithContent, childName, grade, worksheetType)
        .then(data => {
          if (data.success) {
            // Generate PDF from the returned worksheet data
            const pdfBlob = worksheetGenerator.generateWorksheetPDF(
              { ...selectedResource, ...data.worksheet },
              childName,
              grade,
              worksheetType
            );
            
            // Create URL for the blob
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
          } else {
            throw new Error(data.message || 'Failed to generate worksheet');
          }
        })
        .catch(error => {
          console.error('Error generating worksheet:', error);
          // Fallback to client-side generation if API call fails
          const pdfBlob = worksheetGenerator.generateWorksheetPDF(
            resourceWithContent, 
            childName, 
            grade, 
            worksheetType
          );
          const url = URL.createObjectURL(pdfBlob);
          setPdfUrl(url);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
    }
  };

  // Handle worksheet type change
  const handleTypeChange = (e) => {
    setWorksheetType(e.target.value);
    
    // Clear previous PDF
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Handle print
  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  // Handle download
  const handleDownload = () => {
    if (pdfUrl && selectedResource) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${selectedResource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_worksheet.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!isOpen || !resources || resources.length === 0) {
    return null;
  }

  // Get appropriate worksheet types for the current resource
  const worksheetTypes = selectedResource 
    ? worksheetGenerator.getWorksheetTypesBySubject(selectedResource.subject || '', grade)
    : Object.values(WORKSHEET_TYPES);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <FileText className="mr-2" size={20} />
            Printable Activity Worksheets
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedResource && (
            <div className="space-y-6">
              {/* Resource info */}
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  {selectedResource.title}
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {selectedResource.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.subject && (
                    <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-md">
                      {selectedResource.subject}
                    </span>
                  )}
                  {selectedResource.type && (
                    <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-md">
                      {selectedResource.type}
                    </span>
                  )}
                </div>
                {isFetchingContent && (
                  <div className="mt-3 flex items-center text-blue-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-2"></div>
                    Fetching resource content...
                  </div>
                )}
              </div>

              {/* Worksheet options */}
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">
                  Worksheet Options
                </h3>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Activity Type
                  </label>
                  <select
                    value={worksheetType}
                    onChange={handleTypeChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {worksheetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={generatePDF}
                  disabled={isGenerating || isFetchingContent}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : isFetchingContent ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Fetching Content...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2" size={18} />
                      Generate Worksheet
                    </>
                  )}
                </button>
              </div>

              {/* PDF Preview */}
              {pdfUrl && (
                <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">
                    Worksheet Preview
                  </h3>
                  
                  <div className="aspect-[8.5/11] bg-white rounded-lg overflow-hidden mb-4">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full"
                      title="Worksheet Preview"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrint}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Printer className="mr-2" size={18} />
                      Print Worksheet
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <Download className="mr-2" size={18} />
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center bg-gray-900">
          <div className="text-gray-400 text-sm">
            Resource {currentIndex + 1} of {resources.length}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full ${
                currentIndex === 0 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              aria-label="Previous resource"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === resources.length - 1}
              className={`p-2 rounded-full ${
                currentIndex === resources.length - 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              aria-label="Next resource"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorksheetPreview;
