"""Universal Recursive Sitemap Discovery System - CMS-agnostic, Production-ready"""

import requests
import gzip
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, urlparse
from typing import Set, List, Optional, Tuple
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecursiveSitemapDiscovery:
    """Universal recursive sitemap discovery system for any CMS structure"""
    
    def __init__(self, base_url: str, max_depth: int = 5, max_sitemaps: int = 50, timeout: int = 10):
        """
        Initialize recursive sitemap discovery
        
        Args:
            base_url: Target website URL
            max_depth: Maximum recursion depth for sitemap indexes
            max_sitemaps: Maximum number of sitemaps to process
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.max_depth = max_depth
        self.max_sitemaps = max_sitemaps
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; AI-Link-Discovery/1.0; +https://sapphiredigital.com)'
        })
        
        # Tracking
        self.discovered_urls: Set[str] = set()
        self.processed_sitemaps: Set[str] = set()
        self.sitemap_count = 0
        self.depth_map = {}  # Track depth of each sitemap
        
        # Statistics
        self.stats = {
            'total_urls': 0,
            'sitemaps_processed': 0,
            'sitemap_indexes_found': 0,
            'urlsets_found': 0,
            'failed_sitemaps': 0,
            'recursion_depth_used': 0
        }
    
    def is_valid_internal_url(self, url: str) -> bool:
        """Check if URL belongs to the target domain"""
        try:
            parsed_base = urlparse(self.base_url)
            parsed_url = urlparse(url)
            
            # Check same domain (allow subdomains)
            base_domain = parsed_base.netloc.replace('www.', '')
            url_domain = parsed_url.netloc.replace('www.', '')
            
            return url_domain.endswith(base_domain) or base_domain.endswith(url_domain)
        except:
            return False
    
    def normalize_url(self, url: str) -> str:
        """Normalize URL for consistent storage"""
        try:
            parsed = urlparse(url)
            # Ensure scheme
            if not parsed.scheme:
                url = 'https://' + url
                parsed = urlparse(url)
            
            # Remove fragment, normalize path
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            
            # Add query if present
            if parsed.query:
                clean_url += f"?{parsed.query}"
            
            # Remove trailing slash for consistency (except root)
            if clean_url != f"{parsed.scheme}://{parsed.netloc}/" and clean_url.endswith('/'):
                clean_url = clean_url.rstrip('/')
            
            return clean_url
        except:
            return url
    
    def fetch_sitemap(self, sitemap_url: str) -> Optional[str]:
        """Fetch sitemap content with support for compression and redirects"""
        try:
            logger.info(f"[DISCOVERY] Fetching sitemap: {sitemap_url}")
            
            response = self.session.get(
                sitemap_url, 
                timeout=self.timeout,
                allow_redirects=True,
                headers={'Accept-Encoding': 'gzip, deflate'}
            )
            
            if response.status_code == 200:
                # Handle gzip compression
                if response.headers.get('content-encoding') == 'gzip':
                    try:
                        content = gzip.decompress(response.content).decode('utf-8')
                    except:
                        content = response.text
                else:
                    content = response.text
                
                logger.info(f"[DISCOVERY] Successfully fetched {sitemap_url} ({len(content)} chars)")
                return content
            else:
                logger.warning(f"[DISCOVERY] HTTP {response.status_code} for {sitemap_url}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"[DISCOVERY] Timeout for {sitemap_url}")
            return None
        except requests.exceptions.RequestException as e:
            logger.warning(f"[DISCOVERY] Request failed for {sitemap_url}: {e}")
            return None
        except Exception as e:
            logger.error(f"[DISCOVERY] Unexpected error fetching {sitemap_url}: {e}")
            return None
    
    def detect_sitemap_type(self, content: str) -> Tuple[str, List[str]]:
        """
        Detect sitemap type and extract URLs
        
        Returns:
            Tuple of (sitemap_type, urls_list)
            sitemap_type: 'sitemapindex' or 'urlset'
        """
        try:
            # Parse XML with proper namespace handling
            root = ET.fromstring(content)
            
            # Handle XML namespaces properly
            namespace = ''
            if root.tag.startswith('{'):
                namespace = root.tag.split('}')[0] + '}'
            
            # Extract local name from namespaced tag
            local_tag = root.tag.split('}')[-1] if '}' in root.tag else root.tag
            sitemap_type = local_tag.lower()
            urls = []
            
            if 'sitemapindex' in sitemap_type:
                # Extract child sitemap URLs
                for loc in root.findall(f'.//{namespace}loc'):
                    if loc.text and loc.text.strip():
                        urls.append(loc.text.strip())
                
                logger.info(f"[DISCOVERY] Found sitemapindex with {len(urls)} children")
                self.stats['sitemap_indexes_found'] += 1
                
            elif 'urlset' in sitemap_type:
                # Extract page URLs
                for url in root.findall(f'.//{namespace}url'):
                    loc = url.find(f'{namespace}loc')
                    if loc is not None and loc.text and loc.text.strip():
                        urls.append(loc.text.strip())
                
                logger.info(f"[DISCOVERY] Found urlset with {len(urls)} URLs")
                self.stats['urlsets_found'] += 1
                
            else:
                logger.warning(f"[DISCOVERY] Unknown sitemap type: {sitemap_type}")
                return 'unknown', []
            
            return sitemap_type, urls
            
        except ET.ParseError as e:
            logger.error(f"[DISCOVERY] XML parse error: {e}")
            # Try alternative parsing method for malformed XML
            try:
                # Remove all namespaces as fallback
                content_clean = re.sub(r'<[^>]*xmlns[^>]*>', '', content)
                content_clean = re.sub(r'\sxmlns[^>]*', '', content_clean)
                root = ET.fromstring(content_clean)
                
                # Extract local name from namespaced tag
                local_tag = root.tag.split('}')[-1] if '}' in root.tag else root.tag
                sitemap_type = local_tag.lower()
                urls = []
                
                if 'sitemapindex' in sitemap_type:
                    for loc in root.findall('.//loc'):
                        if loc.text and loc.text.strip():
                            urls.append(loc.text.strip())
                    self.stats['sitemap_indexes_found'] += 1
                    
                elif 'urlset' in sitemap_type:
                    for url in root.findall('.//url'):
                        loc = url.find('loc')
                        if loc is not None and loc.text and loc.text.strip():
                            urls.append(loc.text.strip())
                    self.stats['urlsets_found'] += 1
                
                logger.info(f"[DISCOVERY] Fallback parsing succeeded: {sitemap_type} with {len(urls)} URLs")
                return sitemap_type, urls
                
            except Exception as fallback_error:
                logger.error(f"[DISCOVERY] Fallback parsing also failed: {fallback_error}")
                return 'error', []
                
        except Exception as e:
            logger.error(f"[DISCOVERY] Error detecting sitemap type: {e}")
            return 'error', []
    
    def process_sitemap_recursive(self, sitemap_url: str, current_depth: int = 0) -> None:
        """
        Recursively process sitemap and extract all URLs
        
        Args:
            sitemap_url: URL of the sitemap to process
            current_depth: Current recursion depth
        """
        # Safety checks
        if current_depth >= self.max_depth:
            logger.warning(f"[DISCOVERY] Max recursion depth ({self.max_depth}) reached for {sitemap_url}")
            return
        
        if self.sitemap_count >= self.max_sitemaps:
            logger.warning(f"[DISCOVERY] Max sitemap count ({self.max_sitemaps}) reached")
            return
        
        if sitemap_url in self.processed_sitemaps:
            logger.info(f"[DISCOVERY] Already processed sitemap: {sitemap_url}")
            return
        
        # Mark as processed
        self.processed_sitemaps.add(sitemap_url)
        self.sitemap_count += 1
        self.depth_map[sitemap_url] = current_depth
        self.stats['recursion_depth_used'] = max(self.stats['recursion_depth_used'], current_depth)
        
        # Fetch sitemap content
        content = self.fetch_sitemap(sitemap_url)
        if not content:
            self.stats['failed_sitemaps'] += 1
            return
        
        # Detect type and extract URLs
        sitemap_type, urls = self.detect_sitemap_type(content)
        
        if sitemap_type == 'sitemapindex':
            # Recursively process child sitemaps
            logger.info(f"[DISCOVERY] Processing {len(urls)} child sitemaps at depth {current_depth + 1}")
            
            for child_sitemap_url in urls:
                if self.sitemap_count >= self.max_sitemaps:
                    break
                
                self.process_sitemap_recursive(child_sitemap_url, current_depth + 1)
        
        elif sitemap_type == 'urlset':
            # Process page URLs
            internal_urls = []
            
            for url in urls:
                if self.is_valid_internal_url(url):
                    normalized_url = self.normalize_url(url)
                    if normalized_url not in self.discovered_urls:
                        self.discovered_urls.add(normalized_url)
                        internal_urls.append(normalized_url)
            
            logger.info(f"[DISCOVERY] Added {len(internal_urls)} internal URLs from {sitemap_url}")
            self.stats['total_urls'] += len(internal_urls)
        
        else:
            logger.error(f"[DISCOVERY] Cannot process sitemap type: {sitemap_type}")
            self.stats['failed_sitemaps'] += 1
    
    def discover_sitemaps_from_robots(self) -> List[str]:
        """Extract sitemap URLs from robots.txt"""
        robots_url = urljoin(self.base_url, '/robots.txt')
        sitemaps = []
        
        try:
            logger.info(f"[DISCOVERY] Checking robots.txt: {robots_url}")
            response = self.session.get(robots_url, timeout=self.timeout)
            
            if response.status_code == 200:
                for line in response.text.splitlines():
                    line = line.strip()
                    if line.lower().startswith('sitemap:'):
                        sitemap_url = line.split(':', 1)[1].strip()
                        if sitemap_url:
                            sitemaps.append(sitemap_url)
                
                logger.info(f"[DISCOVERY] Found {len(sitemaps)} sitemaps in robots.txt")
            
        except Exception as e:
            logger.warning(f"[DISCOVERY] Failed to fetch robots.txt: {e}")
        
        return sitemaps
    
    def discover_initial_sitemaps(self) -> List[str]:
        """Find initial sitemap URLs using multiple strategies"""
        sitemaps = []
        
        # Strategy 1: robots.txt
        robots_sitemaps = self.discover_sitemaps_from_robots()
        sitemaps.extend(robots_sitemaps)
        
        # Strategy 2: Common sitemap locations
        common_locations = [
            '/sitemap.xml',
            '/sitemap_index.xml', 
            '/sitemaps.xml',
            '/sitemap/sitemap.xml',
            '/wp-sitemap.xml',  # WordPress
            '/sitemap_index.xml.gz'  # Compressed
        ]
        
        for location in common_locations:
            sitemap_url = self.base_url + location
            if sitemap_url not in sitemaps:
                # Quick HEAD check to avoid fetching content twice
                try:
                    response = self.session.head(sitemap_url, timeout=5)
                    if response.status_code == 200:
                        sitemaps.append(sitemap_url)
                        logger.info(f"[DISCOVERY] Found sitemap at: {sitemap_url}")
                except:
                    continue
        
        # Strategy 3: Check for WordPress-style sitemaps
        wp_sitemap_patterns = [
            '/wp-sitemap.xml',
            '/wp-sitemaps.xml'
        ]
        
        for pattern in wp_sitemap_patterns:
            sitemap_url = self.base_url + pattern
            if sitemap_url not in sitemaps:
                try:
                    response = self.session.head(sitemap_url, timeout=5)
                    if response.status_code == 200:
                        sitemaps.append(sitemap_url)
                        logger.info(f"[DISCOVERY] Found WordPress sitemap at: {sitemap_url}")
                except:
                    continue
        
        logger.info(f"[DISCOVERY] Initial sitemap discovery found {len(sitemaps)} sitemaps")
        return sitemaps
    
    def discover_all_urls(self) -> Set[str]:
        """
        Main method to discover all URLs from recursive sitemap processing
        
        Returns:
            Set of unique internal URLs
        """
        start_time = time.time()
        logger.info(f"[DISCOVERY] Starting recursive sitemap discovery for {self.base_url}")
        
        # Find initial sitemaps
        initial_sitemaps = self.discover_initial_sitemaps()
        
        if not initial_sitemaps:
            logger.warning(f"[DISCOVERY] No sitemaps found for {self.base_url}")
            return set()
        
        # Process sitemaps recursively
        for sitemap_url in initial_sitemaps:
            if self.sitemap_count >= self.max_sitemaps:
                break
            
            logger.info(f"[DISCOVERY] Processing initial sitemap: {sitemap_url}")
            self.process_sitemap_recursive(sitemap_url, current_depth=0)
        
        # Update final stats
        self.stats['sitemaps_processed'] = len(self.processed_sitemaps)
        
        duration = time.time() - start_time
        logger.info(f"[DISCOVERY] Recursive discovery completed in {duration:.2f}s")
        logger.info(f"[DISCOVERY] Total unique URLs collected: {len(self.discovered_urls)}")
        logger.info(f"[DISCOVERY] Sitemaps processed: {self.stats['sitemaps_processed']}")
        logger.info(f"[DISCOVERY] Sitemap indexes: {self.stats['sitemap_indexes_found']}")
        logger.info(f"[DISCOVERY] URL sets: {self.stats['urlsets_found']}")
        logger.info(f"[DISCOVERY] Failed sitemaps: {self.stats['failed_sitemaps']}")
        logger.info(f"[DISCOVERY] Max recursion depth used: {self.stats['recursion_depth_used']}")
        
        return self.discovered_urls
    
    def get_statistics(self) -> dict:
        """Get discovery statistics"""
        return {
            **self.stats,
            'unique_urls': len(self.discovered_urls),
            'base_url': self.base_url,
            'max_depth_limit': self.max_depth,
            'max_sitemaps_limit': self.max_sitemaps
        }


def discover_all_sitemap_urls(base_url: str, max_depth: int = 5, max_sitemaps: int = 50) -> Tuple[Set[str], dict]:
    """
    Convenience function to discover all URLs from sitemaps
    
    Args:
        base_url: Target website URL
        max_depth: Maximum recursion depth
        max_sitemaps: Maximum sitemaps to process
        
    Returns:
        Tuple of (urls_set, statistics_dict)
    """
    discovery = RecursiveSitemapDiscovery(base_url, max_depth, max_sitemaps)
    urls = discovery.discover_all_urls()
    stats = discovery.get_statistics()
    
    return urls, stats


# Example usage and testing
if __name__ == "__main__":
    # Test with the target site
    test_url = "https://www.sapphiredigitalagency.com"
    
    print(f"🔍 Testing recursive sitemap discovery for: {test_url}")
    
    urls, stats = discover_all_sitemap_urls(test_url, max_depth=5, max_sitemaps=50)
    
    print(f"\n📊 Results:")
    print(f"Total URLs discovered: {len(urls)}")
    print(f"Sitemaps processed: {stats['sitemaps_processed']}")
    print(f"Sitemap indexes found: {stats['sitemap_indexes_found']}")
    print(f"URL sets found: {stats['urlsets_found']}")
    print(f"Failed sitemaps: {stats['failed_sitemaps']}")
    print(f"Max recursion depth used: {stats['recursion_depth_used']}")
    
    print(f"\n🔗 First 10 URLs:")
    for i, url in enumerate(list(urls)[:10]):
        print(f"{i+1}. {url}")
    
    if len(urls) > 10:
        print(f"... and {len(urls) - 10} more URLs")
