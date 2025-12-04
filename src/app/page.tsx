"use client";
import React, { useEffect, useMemo, useState } from "react";
import useGetBlogs from "@/client-apis/blog/useGetBlogs";
import { useRouter, useSearchParams } from "next/navigation";
import { GetBlogParam } from "@/types/types";
import AddBlogModal from "./components/AddBlogModal";
import HeaderSection from "./components/HeaderSection";
import SearchBar from "./components/SearchBar";
import PaginationSection from "./components/PaginationSection";
import NoResults from "./components/NoResults";
import BlogGrid from "./components/BlogGrids";

// Create a separate component that uses useSearchParams
function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);

  useEffect(() => {
    if (searchInput.length > 0) {
      const timer = setTimeout(() => {
        if (searchInput != debouncedValue) setDebouncedValue(searchInput);
      }, 300);
      return () => clearTimeout(timer);
    } else setDebouncedValue("");
  }, [searchInput, debouncedValue]); // Fixed: added debouncedValue to dependencies

  const options = useMemo<GetBlogParam>(
    () => ({
      page: parseInt(searchParams.get("page") || "1", 10),
      size: parseInt(searchParams.get("size") || "6", 10),
      search: debouncedValue || "",
    }),
    [searchParams, debouncedValue],
  );

  const {
    data: blogs,
    isPending: isBlogsLoading,
    refetch,
  } = useGetBlogs(options);

  const numOfPages = useMemo(() => {
    const size = parseInt(searchParams.get("size") || "6", 10);
    const count = blogs?.count || 0;
    return Math.ceil(count / size);
  }, [searchParams, blogs]);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    const totalItems = blogs?.count || 0;
    const newNumOfPages = Math.ceil(totalItems / newSize);
    const adjustedPage = Math.min(currentPage, newNumOfPages || 1);
    router.push(`/?page=${adjustedPage}&size=${newSize}`);
  };

  return (
    <section className="w-full min-h-dvh flex flex-col p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <HeaderSection onAddBlog={() => setIsAddBlogModalOpen(true)} />

      <div className="w-full lg:-mt-30 flex justify-center">
        <div className="w-full lg:w-1/4 xl:w-2/5">
          <SearchBar value={searchInput} onChange={setSearchInput} />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex-1">
        <BlogGrid
          blogs={blogs}
          isLoading={isBlogsLoading}
          searchTerm={debouncedValue}
        />
        {!isBlogsLoading && (!blogs || blogs.items.length === 0) && (
          <NoResults />
        )}
      </div>

      <PaginationSection
        currentPage={currentPage}
        numOfPages={numOfPages}
        size={searchParams.get("size") || "6"}
        handleSizeChange={handleSizeChange}
      />

      <AddBlogModal
        isOpen={isAddBlogModalOpen}
        onClose={() => setIsAddBlogModalOpen(false)}
        onBlogCreated={refetch}
      />
    </section>
  );
}

// Main page component wrapped with Suspense
const Page = () => {
  return (
    <React.Suspense
      fallback={
        <div className="w-full min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <PageContent />
    </React.Suspense>
  );
};

export default Page;
