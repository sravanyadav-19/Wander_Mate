import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search as SearchIcon, MapPin, Star, Navigation, Clock } from "lucide-react";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Popular destinations",
    "Nearby attractions",
    "Local restaurants",
    "Parks and gardens"
  ]);

  // Generate search results based on the query
  const getSearchResults = (searchQuery: string) => {
    const queryLower = searchQuery.toLowerCase();
    
    // Results for Mumbai
    if (queryLower.includes('mumbai') || queryLower.includes('bombay')) {
      return [
        {
          id: 1,
          name: "Gateway of India",
          address: "Apollo Bandar, Colaba, Mumbai, Maharashtra 400001",
          distance: "0.8 km",
          rating: 4.6,
          category: "Landmark",
          estimatedTime: "3 min"
        },
        {
          id: 2,
          name: "Marine Drive",
          address: "Marine Drive, Mumbai, Maharashtra",
          distance: "1.2 km",
          rating: 4.5,
          category: "Promenade",
          estimatedTime: "4 min"
        },
        {
          id: 3,
          name: "Chhatrapati Shivaji Terminus",
          address: "Chhatrapati Shivaji Terminus Area, Fort, Mumbai, Maharashtra 400001",
          distance: "2.5 km",
          rating: 4.7,
          category: "Heritage Site",
          estimatedTime: "8 min"
        },
        {
          id: 4,
          name: "Elephanta Caves",
          address: "Elephanta Island, Mumbai, Maharashtra",
          distance: "11.2 km",
          rating: 4.4,
          category: "Historical Site",
          estimatedTime: "1 hr 15 min"
        }
      ];
    }
    
    // Results for Delhi
    if (queryLower.includes('delhi')) {
      return [
        {
          id: 1,
          name: "Red Fort",
          address: "Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006",
          distance: "1.8 km",
          rating: 4.5,
          category: "Historical Fort",
          estimatedTime: "10 min"
        },
        {
          id: 2,
          name: "India Gate",
          address: "Rajpath, India Gate, New Delhi, Delhi 110001",
          distance: "3.2 km",
          rating: 4.6,
          category: "Memorial",
          estimatedTime: "15 min"
        },
        {
          id: 3,
          name: "Lotus Temple",
          address: "Lotus Temple Rd, Bahapur, Shambhu Dayal Bagh, Kalkaji, New Delhi, Delhi 110019",
          distance: "8.5 km",
          rating: 4.7,
          category: "Temple",
          estimatedTime: "28 min"
        }
      ];
    }
    
    // Default results for other searches
    return [
      {
        id: 1,
        name: `Popular attractions in ${searchQuery}`,
        address: `${searchQuery} city center`,
        distance: "2.5 km",
        rating: 4.5,
        category: "Attractions",
        estimatedTime: "15 min"
      },
      {
        id: 2,
        name: `${searchQuery} Historical Sites`,
        address: `Heritage area, ${searchQuery}`,
        distance: "4.1 km",
        rating: 4.3,
        category: "Heritage",
        estimatedTime: "20 min"
      },
      {
        id: 3,
        name: `${searchQuery} Local Markets`,
        address: `Market district, ${searchQuery}`,
        distance: "1.8 km",
        rating: 4.4,
        category: "Shopping",
        estimatedTime: "12 min"
      }
    ];
  };

  const searchResults = getSearchResults(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Search Header */}
        <header className="bg-background border-b border-border px-4 py-4">
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Where do you want to go?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </form>
        </header>

        <div className="flex-1 px-4 py-6">
          {/* Recent Searches */}
          {!query && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Recent Searches</h2>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer transition-smooth hover:shadow-elegant"
                    onClick={() => {
                      setQuery(search);
                      handleSearch(new Event('submit') as any);
                    }}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Search Results */}
          {query && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {isSearching ? "Searching..." : `Results for "${query}"`}
                </h2>
                {!isSearching && (
                  <span className="text-sm text-muted-foreground">
                    {searchResults.length} found
                  </span>
                )}
              </div>

              {isSearching ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <Card 
                      key={result.id} 
                      className="cursor-pointer transition-smooth hover:shadow-elegant"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{result.name}</h3>
                            <p className="text-sm text-muted-foreground">{result.address}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{result.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{result.distance}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              <span>{result.estimatedTime}</span>
                            </div>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {result.category}
                            </span>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/route/${encodeURIComponent(result.name)}`);
                            }}
                          >
                            Get Directions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;