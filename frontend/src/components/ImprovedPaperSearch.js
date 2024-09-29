import React, { useState } from 'react';
import { Search, Filter, Calendar, User } from 'lucide-react';
import { Input, Button, Select, DatePicker } from '@/components/ui/form';

const ImprovedPaperSearch = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    arxivId: '',
    keyword: '',
    author: '',
    category: '',
    startDate: null,
    endDate: null,
  });

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleDateChange = (dates) => {
    setSearchParams({ ...searchParams, startDate: dates[0], endDate: dates[1] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="arxivId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            arXiv ID
          </label>
          <Input
            id="arxivId"
            name="arxivId"
            value={searchParams.arxivId}
            onChange={handleChange}
            placeholder="e.g., 2104.08730"
            className="w-full"
            icon={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Keyword
          </label>
          <Input
            id="keyword"
            name="keyword"
            value={searchParams.keyword}
            onChange={handleChange}
            placeholder="Enter keywords"
            className="w-full"
            icon={<Filter className="h-4 w-4 text-gray-400" />}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Author
          </label>
          <Input
            id="author"
            name="author"
            value={searchParams.author}
            onChange={handleChange}
            placeholder="Author name"
            className="w-full"
            icon={<User className="h-4 w-4 text-gray-400" />}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Category
          </label>
          <Select
            id="category"
            name="category"
            value={searchParams.category}
            onChange={handleChange}
            className="w-full"
          >
            <option value="">All Categories</option>
            <option value="cs.AI">Computer Science - Artificial Intelligence</option>
            <option value="physics">Physics</option>
            <option value="math">Mathematics</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Date Range
          </label>
          <DatePicker
            id="dateRange"
            selected={searchParams.startDate}
            onChange={handleDateChange}
            startDate={searchParams.startDate}
            endDate={searchParams.endDate}
            selectsRange
            className="w-full"
            icon={<Calendar className="h-4 w-4 text-gray-400" />}
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto">
        Search Papers
      </Button>
    </form>
  );
};

export default ImprovedPaperSearch;