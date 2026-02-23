import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import maximum_bipartite_matching

class MatchingEngine:
    def __init__(self, weights_matrix):
        # La matrice de scores (Poids 3, 2, ou 1)
        self.matrix = csr_matrix(weights_matrix)

    def get_optimized_pairs(self):
        """Retourne les paires optimisées par itérations successives"""
        local_graph = self.matrix.copy()
        iterations = []
        
        while local_graph.count_nonzero() > 0:
            # Ton algo de maximum matching
            matching = maximum_bipartite_matching(local_graph, perm_type='column')
            iterations.append(matching)
            
            # On supprime les arêtes trouvées pour passer au rdv suivant
            for company_idx, student_idx in enumerate(matching):
                if student_idx != -1:
                    local_graph[company_idx, student_idx] = 0
            local_graph.eliminate_zeros()
            
        return iterations