import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useDashboard } from '@/components/DashboardLayout';
import { Doc } from '@/lib/types';
import { convertBlobToFile } from '@/lib/utils';
import { calculateMembers, calculateProjects, calculateSolutions, parseMultipleCSVFileObjects } from '@/lib/csvParser';
import { TEAMS } from '@/lib/teams';

export const useDocs = () => {
  const { setDocs, setOpenSheet, setData, setProjects, setSolutions, setMembers } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  const getDocs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/list');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const docs: Doc[] = result.docs?.filter((doc: Doc) => !doc.name.startsWith('.emptyFolderPlaceholder')) || [];

      setDocs(docs);
    } catch (err) {
      console.error("Error fetching docs:", err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocs = async (docs: Doc[]) => {
    setDownloading(true);
    try {
      const downloadPromises = docs.map(async (doc) => {
        const response = await fetch(`/api/v1/download?name=${doc.name}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();

        return blob;
      });

      const blobs = await Promise.all(downloadPromises);

      const files = blobs.map((blob, index) => {
        const file = convertBlobToFile(blob, docs[index].name);
        return file;
      });

      parseDocsAndGo(files);
      setOpenSheet(false);
    } catch (err) {
      console.error("Error downloading doc:", err);
    } finally {
      setDownloading(false);
    }
  };

  const parseDocsAndGo = async (docs: File[]) => {
    const combinedIssues = await parseMultipleCSVFileObjects(docs);
    setData(combinedIssues);

    // Calculate projects from the combined data
    const projects = calculateProjects(combinedIssues);
    setProjects(projects);

    // Calculate solutions from the combined data
    const solutions = calculateSolutions(combinedIssues);
    setSolutions(solutions);

    // Calculate members from the combined data and teams
    const members = calculateMembers(combinedIssues, TEAMS);
    setMembers(members);

    router.push("/projects");
  };

  const deleteDocs = async (docs: Doc[]) => {
    try {
      setDeleting(true);
      const deletePromises = docs.map(async (doc) => {
        const response = await fetch(`/api/v1/delete?name=${doc.name}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
      });

      await Promise.all(deletePromises);
      // Refresh the docs list after deletion
      await getDocs();
    } catch (err) {
      console.error("Error deleting docs:", err);
    } finally {
      setDeleting(false);
    }
  };

  return { loading, downloading, deleting, getDocs, downloadDocs, parseDocsAndGo, deleteDocs };
};
